package com.worldcup2026.calendrierservice.service.sync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Service de synchronisation des equipes depuis l'API WC2026.
 *
 * Responsabilite unique (SRP) : tout ce qui touche a la table {@code equipe}
 * (upsert, dedoublonnage, suppression des equipes obsoletes). Ne touche ni
 * aux classements, ni aux matchs.
 *
 * L'appelant doit invoquer ce service AVANT les services de sync classement et
 * match, car ceux-ci referencent les equipes.
 */
@Service
public class EquipeSyncService implements ISyncService {

    private static final Logger log = LoggerFactory.getLogger(EquipeSyncService.class);

    private final IExternalApiClient externalApi;
    private final EquipeRepository equipeRepository;
    private final GroupeRepository groupeRepository;
    private final ClassementRepository classementRepository;
    private final ObjectMapper jsonMapper = new ObjectMapper();

    public EquipeSyncService(IExternalApiClient externalApi,
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
        return "equipes";
    }

    /**
     * Synchronisation complete : upsert des 48 equipes officielles, puis
     * nettoyage des doublons et des equipes obsoletes.
     */
    @Override
    @Transactional
    public void synchroniser() {
        log.info("Sync equipes depuis WC2026 API /teams...");
        JsonNode teams = recupererPayloadTeams();
        if (teams == null) return;

        SyncResult resultat = upserterEquipes(teams);
        log.info("Sync equipes OK - {} equipes", resultat.equipesSynchronisees);

        // 2 passes de nettoyage successives : d'abord les doublons (meme code),
        // puis les equipes dont l'id n'apparait plus dans la payload officielle.
        int doublons = nettoyerDoublons(resultat.codesOfficiels, resultat.idsOfficiels);
        if (doublons > 0) {
            log.info("Nettoyage : {} doublon(s) d'equipe supprime(s)", doublons);
        }

        int obsoletes = nettoyerObsoletes(resultat.idsOfficiels);
        if (obsoletes > 0) {
            log.info("Nettoyage : {} equipe(s) obsolete(s) supprimee(s) "
                    + "- BDD alignee sur les equipes officielles", obsoletes);
        }
    }

    // =========================================================================
    // ETAPE 1 : recuperation + parsing de la payload /teams
    // =========================================================================

    /**
     * Appelle l'API externe et retourne le noeud JSON racine contenant la liste
     * des equipes, ou null si la reponse n'est pas exploitable.
     */
    private JsonNode recupererPayloadTeams() {
        String json = externalApi.getTeams();
        if (json == null || json.isBlank()) {
            log.warn("Reponse /teams vide ou indisponible");
            return null;
        }

        JsonNode root;
        try {
            root = jsonMapper.readTree(json);
        } catch (Exception e) {
            log.error("Impossible de parser /teams : {}", e.getMessage());
            return null;
        }

        // L'API peut renvoyer soit un tableau direct, soit un objet avec champ "data".
        JsonNode teams = root.isArray() ? root : root.path("data");
        if (!teams.isArray()) {
            log.warn("Reponse /teams invalide (pas un tableau)");
            return null;
        }
        return teams;
    }

    // =========================================================================
    // ETAPE 2 : upsert des equipes + collecte des ids et codes officiels
    // =========================================================================

    /**
     * Pour chaque equipe de la payload : cree ou met a jour la ligne correspondante
     * en BDD, rattache au groupe, et collecte les identifiants officiels (ids + codes)
     * qui serviront aux etapes de nettoyage.
     */
    private SyncResult upserterEquipes(JsonNode teams) {
        Set<Long> idsOfficiels = new HashSet<>();
        Set<String> codesOfficiels = new HashSet<>();
        int count = 0;

        for (JsonNode teamNode : teams) {
            Long id = teamNode.path("id").asLong(0);
            if (id == 0) continue;  // entree malformee, on saute

            Groupe groupe = resoudreOuCreerGroupe(teamNode.path("group_name").asText(null));

            // Si l'equipe existe deja : on met a jour ses champs.
            // Sinon : on en cree une nouvelle avec l'id fourni par l'API.
            Equipe equipe = equipeRepository.findById(id).orElseGet(Equipe::new);
            equipe.setId(id);
            equipe.setNom(teamNode.path("name").asText());
            String code = teamNode.path("code").asText(null);
            equipe.setCode(code);
            equipe.setLogo(teamNode.path("flag_url").asText(null));
            // La confederation n'est pas fournie par l'API : on ne la touche pas
            // (pourra etre alimentee par un autre canal plus tard).
            equipe.setGroupe(groupe);
            equipeRepository.save(equipe);

            idsOfficiels.add(id);
            if (code != null) codesOfficiels.add(code);
            count++;
        }
        return new SyncResult(count, idsOfficiels, codesOfficiels);
    }

    /**
     * Recupere le groupe par son nom, ou le cree s'il n'existe pas.
     * Retourne null si le nom de groupe est vide ou absent.
     */
    private Groupe resoudreOuCreerGroupe(String nomGroupe) {
        if (nomGroupe == null || nomGroupe.isBlank()) return null;
        return groupeRepository.findByNom(nomGroupe)
                .orElseGet(() -> groupeRepository.save(Groupe.builder().nom(nomGroupe).build()));
    }

    // =========================================================================
    // ETAPE 3 : nettoyage des doublons de code (legacy des anciennes syncs bugueesS)
    // =========================================================================

    /**
     * Pour chaque code officiel de la payload : si plusieurs lignes en BDD partagent
     * ce code, on conserve uniquement celle dont l'id appartient aux ids officiels,
     * et on supprime les autres (y compris leur classement lie pour respecter la FK).
     */
    private int nettoyerDoublons(Set<String> codesOfficiels, Set<Long> idsOfficiels) {
        int doublonsSupprimes = 0;
        for (String code : codesOfficiels) {
            List<Equipe> duplicats = equipeRepository.findAllByCode(code);
            if (duplicats.size() <= 1) continue;

            for (Equipe dup : duplicats) {
                if (!idsOfficiels.contains(dup.getId())) {
                    supprimerEquipeEtClassementLie(dup);
                    doublonsSupprimes++;
                    log.warn("Doublon supprime : equipe id={} code={}", dup.getId(), code);
                }
            }
        }
        return doublonsSupprimes;
    }

    // =========================================================================
    // ETAPE 4 : nettoyage des equipes dont l'id a disparu de la payload officielle
    // =========================================================================

    /**
     * Supprime toutes les equipes en BDD dont l'id n'apparait PAS dans les ids
     * officiels fournis par l'API.
     *
     * Garde-fou important : si la payload est vide (idsOfficiels vide), on NE
     * supprime rien. Sinon une erreur API temporaire viderait toute la BDD.
     */
    private int nettoyerObsoletes(Set<Long> idsOfficiels) {
        if (idsOfficiels.isEmpty()) {
            log.warn("Liste d'ids officiels vide - nettoyage des obsoletes annule par securite");
            return 0;
        }

        int supprimees = 0;
        List<Equipe> toutes = equipeRepository.findAll();
        for (Equipe equipe : toutes) {
            if (!idsOfficiels.contains(equipe.getId())) {
                log.warn("Equipe obsolete supprimee : id={} code={} nom={}",
                        equipe.getId(), equipe.getCode(), equipe.getNom());
                supprimerEquipeEtClassementLie(equipe);
                supprimees++;
            }
        }
        return supprimees;
    }

    /**
     * Supprime une equipe en respectant la contrainte de cle etrangere depuis
     * la table {@code classement} : le classement lie est supprime en premier.
     */
    private void supprimerEquipeEtClassementLie(Equipe equipe) {
        classementRepository.findByEquipe_Id(equipe.getId())
                .ifPresent(classementRepository::delete);
        equipeRepository.delete(equipe);
    }

    /** Resultat interne de l'etape d'upsert, utilise par les etapes de nettoyage. */
    private record SyncResult(int equipesSynchronisees,
                              Set<Long> idsOfficiels,
                              Set<String> codesOfficiels) {}
}
