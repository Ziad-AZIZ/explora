package com.worldcup2026.calendrierservice.service.sync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldcup2026.calendrierservice.model.postgres.Classement;
import com.worldcup2026.calendrierservice.model.postgres.Equipe;
import com.worldcup2026.calendrierservice.model.postgres.Groupe;
import com.worldcup2026.calendrierservice.repository.postgres.ClassementRepository;
import com.worldcup2026.calendrierservice.repository.postgres.EquipeRepository;
import com.worldcup2026.calendrierservice.repository.postgres.GroupeRepository;
import com.worldcup2026.calendrierservice.service.api.IExternalApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service de synchronisation des classements depuis l'API WC2026.
 *
 * Responsabilite unique (SRP) : gere la table {@code classement}. Deux modes :
 *  - Mode normal : l'endpoint /standings repond, on met a jour les classements.
 *  - Mode fallback : /standings renvoie 404 (tournoi pas encore commence),
 *    on initialise un classement a 0 pour chaque equipe connue.
 *
 * Depend de : {@link EquipeSyncService} (les equipes doivent etre en BDD avant).
 */
@Service
public class ClassementSyncService implements ISyncService {

    private static final Logger log = LoggerFactory.getLogger(ClassementSyncService.class);

    private final IExternalApiClient externalApi;
    private final EquipeRepository equipeRepository;
    private final GroupeRepository groupeRepository;
    private final ClassementRepository classementRepository;
    private final ObjectMapper jsonMapper = new ObjectMapper();

    public ClassementSyncService(IExternalApiClient externalApi,
                                 EquipeRepository equipeRepository,
                                 GroupeRepository groupeRepository,
                                 ClassementRepository classementRepository) {
        this.externalApi = externalApi;
        this.equipeRepository = equipeRepository;
        this.groupeRepository = groupeRepository;
        this.classementRepository = classementRepository;
    }

    @Override
    public String domaine() {
        return "classements";
    }

    @Override
    @Transactional
    public void synchroniser() {
        log.info("Sync classements depuis WC2026 API /standings...");

        String json = appelerStandings();

        // Cas 1 : endpoint indisponible (404, erreur, payload vide) -> fallback
        if (json == null || json.isBlank()) {
            log.info("Pas de donnees /standings - initialisation des classements a 0");
            initialiserClassementsAZero();
            return;
        }

        // Cas 2 : on a une payload, on essaie de la parser
        JsonNode standings = parserPayload(json);
        if (standings == null || !standings.isArray() || standings.isEmpty()) {
            log.warn("Reponse /standings inexploitable - fallback init a zero");
            initialiserClassementsAZero();
            return;
        }

        // Cas 3 : payload valide, on met a jour
        int count = mettreAJourClassements(standings);
        log.info("Sync classements OK - {} entrees mises a jour", count);
    }

    /** Appelle l'API avec un filet de securite pour les exceptions non prevues. */
    private String appelerStandings() {
        try {
            return externalApi.getStandings();
        } catch (Exception e) {
            log.warn("Appel /standings en echec : {} - fallback init a zero", e.getMessage());
            return null;
        }
    }

    /** Parse la payload JSON en noeud tableau. Retourne null en cas d'erreur. */
    private JsonNode parserPayload(String json) {
        try {
            JsonNode root = jsonMapper.readTree(json);
            return root.isArray() ? root : root.path("data");
        } catch (Exception e) {
            log.error("Impossible de parser /standings : {}", e.getMessage());
            return null;
        }
    }

    /**
     * Boucle sur les entrees du classement recu et cree/met a jour une ligne
     * en BDD pour chaque equipe reconnue (par code).
     */
    private int mettreAJourClassements(JsonNode standings) {
        int count = 0;
        for (JsonNode entry : standings) {
            String teamCode = entry.path("team_code").asText(null);
            if (teamCode == null) continue;

            Equipe equipe = equipeRepository.findFirstByCodeOrderByIdAsc(teamCode).orElse(null);
            if (equipe == null) {
                log.warn("Equipe introuvable pour le code '{}'", teamCode);
                continue;
            }

            // Rattacher au groupe si l'equipe n'en a pas (cas limite si la sync
            // equipes n'avait pas de group_name pour cette equipe).
            rattacherGroupeSiManquant(equipe, entry.path("group").asText(null));

            Classement classement = classementRepository.findByEquipe_Id(equipe.getId())
                    .orElseGet(() -> Classement.builder().equipe(equipe).build());

            classement.setPosition(entry.path("position").asInt());
            classement.setPoints(entry.path("points").asInt());
            classement.setMatchsJoues(entry.path("played").asInt());
            classement.setVictoires(entry.path("won").asInt());
            classement.setNuls(entry.path("drawn").asInt());
            classement.setDefaites(entry.path("lost").asInt());
            classement.setButsPour(entry.path("goals_for").asInt());
            classement.setButsContre(entry.path("goals_against").asInt());
            classement.setDifference(entry.path("goal_difference").asInt());
            classement.setDerniereMiseAJour(LocalDateTime.now());

            classementRepository.save(classement);
            count++;
        }
        return count;
    }

    /** Rattache une equipe a un groupe s'il est fourni et qu'elle n'en a pas deja un. */
    private void rattacherGroupeSiManquant(Equipe equipe, String nomGroupe) {
        if (nomGroupe == null || nomGroupe.isBlank()) return;
        if (equipe.getGroupe() != null) return;

        Groupe groupe = groupeRepository.findByNom(nomGroupe)
                .orElseGet(() -> groupeRepository.save(Groupe.builder().nom(nomGroupe).build()));
        equipe.setGroupe(groupe);
        equipeRepository.save(equipe);
    }

    /**
     * Cree un classement a zero pour chaque equipe qui n'en a pas encore.
     * Utilise quand /standings est 404 (ex: avant le debut du tournoi).
     * Ne touche PAS aux classements existants : si /standings a deja repondu
     * par le passe, l'historique est preserve.
     */
    void initialiserClassementsAZero() {
        List<Equipe> equipes = equipeRepository.findAll();
        if (equipes.isEmpty()) {
            log.warn("Aucune equipe en base - synchroniser les equipes avant");
            return;
        }

        int crees = 0;
        int existants = 0;
        for (Equipe equipe : equipes) {
            if (classementRepository.findByEquipe_Id(equipe.getId()).isPresent()) {
                existants++;
                continue;
            }
            Classement nouveau = Classement.builder()
                    .equipe(equipe)
                    .position(0).points(0)
                    .matchsJoues(0).victoires(0).nuls(0).defaites(0)
                    .butsPour(0).butsContre(0).difference(0)
                    .derniereMiseAJour(LocalDateTime.now())
                    .build();
            classementRepository.save(nouveau);
            crees++;
        }
        log.info("Init classements a 0 : {} crees, {} deja presents (total equipes : {})",
                crees, existants, equipes.size());
    }
}
