package com.worldcup2026.calendrierservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldcup2026.calendrierservice.model.mongo.MatchLive;
import com.worldcup2026.calendrierservice.model.postgres.Classement;
import com.worldcup2026.calendrierservice.model.postgres.Equipe;
import com.worldcup2026.calendrierservice.model.postgres.Groupe;
import com.worldcup2026.calendrierservice.repository.mongo.MatchLiveRepository;
import com.worldcup2026.calendrierservice.repository.postgres.ClassementRepository;
import com.worldcup2026.calendrierservice.repository.postgres.EquipeRepository;
import com.worldcup2026.calendrierservice.repository.postgres.GroupeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class SynchronisationService {

    private static final Logger log = LoggerFactory.getLogger(SynchronisationService.class);

    private final Wc2026ApiService wc2026ApiService;
    private final EquipeRepository equipeRepository;
    private final GroupeRepository groupeRepository;
    private final ClassementRepository classementRepository;
    private final MatchLiveRepository matchLiveRepository;
    private final ObjectMapper mapper = new ObjectMapper();

    public SynchronisationService(Wc2026ApiService wc2026ApiService,
                                   EquipeRepository equipeRepository,
                                   GroupeRepository groupeRepository,
                                   ClassementRepository classementRepository,
                                   MatchLiveRepository matchLiveRepository) {
        this.wc2026ApiService = wc2026ApiService;
        this.equipeRepository = equipeRepository;
        this.groupeRepository = groupeRepository;
        this.classementRepository = classementRepository;
        this.matchLiveRepository = matchLiveRepository;
    }

    @Transactional
    public void synchroniserEquipes() {
        log.info("Sync equipes depuis WC2026 API /teams...");
        String json = wc2026ApiService.getTeams();
        JsonNode root;
        try {
            root = mapper.readTree(json);
        } catch (Exception e) {
            log.error("Impossible de parser /teams : {}", e.getMessage());
            return;
        }

        JsonNode teams = root.isArray() ? root : root.path("data");
        if (!teams.isArray()) {
            log.warn("Reponse /teams invalide ou vide");
            return;
        }

        int count = 0;
        java.util.Set<Long> idsOfficiels = new java.util.HashSet<>();
        java.util.Set<String> codesOfficiels = new java.util.HashSet<>();
        for (JsonNode teamNode : teams) {
            // L'API WC2026 renvoie "group_name" (pas "group")
            String groupeNom = teamNode.path("group_name").asText(null);
            Groupe groupe = null;
            if (groupeNom != null && !groupeNom.isBlank()) {
                final String nom = groupeNom;
                groupe = groupeRepository.findByNom(nom)
                        .orElseGet(() -> groupeRepository.save(
                                Groupe.builder().nom(nom).build()));
            }

            Long id = teamNode.path("id").asLong(0);
            if (id == 0) continue;

            Equipe equipe = equipeRepository.findById(id).orElse(new Equipe());
            equipe.setId(id);
            equipe.setNom(teamNode.path("name").asText());
            String code = teamNode.path("code").asText(null);
            equipe.setCode(code);
            // L'API renvoie "flag_url" (pas "flag")
            equipe.setLogo(teamNode.path("flag_url").asText(null));
            // "confederation" n'est pas fourni par l'API WC2026 : on le laisse tel quel
            // (pourra etre rempli plus tard a partir d'une autre source).
            equipe.setGroupe(groupe);
            equipeRepository.save(equipe);

            idsOfficiels.add(id);
            if (code != null) codesOfficiels.add(code);
            count++;
        }
        log.info("Sync equipes OK - {} equipes", count);

        // Nettoyage des doublons : pour chaque code officiel, si plusieurs equipes existent
        // en BDD avec ce meme code, on supprime celles dont l'id n'est pas celui de l'API.
        // Protege les lookups findByCode() (qui echouaient avec "2 results returned").
        int doublonsSupprimes = 0;
        for (String code : codesOfficiels) {
            List<Equipe> duplicats = equipeRepository.findAllByCode(code);
            if (duplicats.size() <= 1) continue;
            for (Equipe dup : duplicats) {
                if (!idsOfficiels.contains(dup.getId())) {
                    // On supprime d'abord le classement lie (FK) si present.
                    classementRepository.findByEquipe_Id(dup.getId())
                            .ifPresent(classementRepository::delete);
                    equipeRepository.delete(dup);
                    doublonsSupprimes++;
                    log.warn("Doublon supprime : equipe id={} code={} (id officiel={})",
                            dup.getId(), code, idsOfficiels);
                }
            }
        }
        if (doublonsSupprimes > 0) {
            log.info("Nettoyage : {} doublon(s) d'equipe supprime(s)", doublonsSupprimes);
        }
    }

    @Transactional
    public void synchroniserEquipesSeules() {
        synchroniserEquipes();
    }

    @Transactional
    public void synchroniserClassements() {
        log.info("Sync classements depuis WC2026 API /standings...");
        String json = null;
        try {
            json = wc2026ApiService.getStandings();
        } catch (Exception e) {
            // Filet de securite : si l'appel remonte malgre tout une exception
            // (autre que 404 deja gere en amont), on bascule sur l'init a zero.
            log.warn("Appel /standings en echec : {} - fallback init a zero", e.getMessage());
        }

        // Cas 1 : l'endpoint /standings n'existe pas (404) ou est indisponible
        // => on initialise un classement a 0 pour toutes les equipes connues.
        if (json == null || json.isBlank()) {
            log.info("Pas de donnees /standings disponibles (tournoi pas encore commence ?) "
                    + "- initialisation des classements a 0");
            initialiserClassementsAZero();
            return;
        }

        JsonNode root;
        try {
            root = mapper.readTree(json);
        } catch (Exception e) {
            log.error("Impossible de parser /standings : {} - fallback init a zero", e.getMessage());
            initialiserClassementsAZero();
            return;
        }

        JsonNode standings = root.isArray() ? root : root.path("data");
        if (!standings.isArray() || standings.isEmpty()) {
            log.warn("Reponse /standings vide - initialisation des classements a 0");
            initialiserClassementsAZero();
            return;
        }

        int count = 0;
        for (JsonNode entry : standings) {
            String groupeNom = entry.path("group").asText(null);
            String teamCode  = entry.path("team_code").asText(null);
            if (teamCode == null) continue;

            Equipe equipe = equipeRepository.findFirstByCodeOrderByIdAsc(teamCode).orElse(null);
            if (equipe == null) {
                log.warn("Equipe introuvable pour le code '{}'", teamCode);
                continue;
            }

            if (groupeNom != null && !groupeNom.isBlank() && equipe.getGroupe() == null) {
                final String nom = groupeNom;
                Groupe groupe = groupeRepository.findByNom(nom)
                        .orElseGet(() -> groupeRepository.save(
                                Groupe.builder().nom(nom).build()));
                equipe.setGroupe(groupe);
                equipeRepository.save(equipe);
            }

            Classement classement = classementRepository.findByEquipe_Id(equipe.getId())
                    .orElse(new Classement());
            classement.setEquipe(equipe);
            classement.setPosition(entry.path("position").asInt());
            classement.setPoints(entry.path("points").asInt());
            classement.setMatchsJoues(entry.path("played").asInt());
            classement.setVictoires(entry.path("won").asInt());
            classement.setNuls(entry.path("drawn").asInt());
            classement.setDefaites(entry.path("lost").asInt());
            classement.setButsPour(entry.path("goals_for").asInt());
            classement.setButsContre(entry.path("goals_against").asInt());
            classement.setDifference(entry.path("goal_difference").asInt());
            classement.setDerniereMiseAJour(java.time.LocalDateTime.now());
            classementRepository.save(classement);
            count++;
        }
        log.info("Sync classements OK - {} entrees mises a jour", count);
    }

    /**
     * Cree un classement a 0 pour chaque equipe connue en base qui n'en a pas encore.
     * Utilise quand /standings est 404 (ex: tournoi pas encore commence).
     * Regroupe les 48 equipes dans leurs 12 groupes (A a L) via la relation Equipe.groupe
     * deja peuplee par synchroniserEquipes().
     */
    @Transactional
    public void initialiserClassementsAZero() {
        List<Equipe> equipes = equipeRepository.findAll();
        if (equipes.isEmpty()) {
            log.warn("Aucune equipe en base - synchroniserEquipes() doit etre appele avant");
            return;
        }

        int crees = 0;
        int existants = 0;
        for (Equipe equipe : equipes) {
            // Si un classement existe deja, on ne l'ecrase pas (on preserve l'historique
            // si jamais /standings a deja repondu par le passe).
            if (classementRepository.findByEquipe_Id(equipe.getId()).isPresent()) {
                existants++;
                continue;
            }
            Classement classement = Classement.builder()
                    .equipe(equipe)
                    .position(0)
                    .points(0)
                    .matchsJoues(0)
                    .victoires(0)
                    .nuls(0)
                    .defaites(0)
                    .butsPour(0)
                    .butsContre(0)
                    .difference(0)
                    .derniereMiseAJour(java.time.LocalDateTime.now())
                    .build();
            classementRepository.save(classement);
            crees++;
        }
        log.info("Init classements a 0 : {} crees, {} deja presents (total equipes : {})",
                crees, existants, equipes.size());
    }

    public void synchroniserMatchs() {
        log.info("Sync matchs depuis WC2026 API /matches...");
        String json = wc2026ApiService.getMatches();
        JsonNode root;
        try {
            root = mapper.readTree(json);
        } catch (Exception e) {
            log.error("Impossible de parser /matches : {}", e.getMessage());
            return;
        }

        JsonNode matches = root.isArray() ? root : root.path("data");
        if (!matches.isArray()) {
            log.warn("Reponse /matches invalide");
            return;
        }

        int count = 0;
        for (JsonNode item : matches) {
            MatchLive match = parseMatch(item);
            if (match != null) {
                matchLiveRepository.save(match);
                count++;
            }
        }
        log.info("Sync matchs OK - {} matchs", count);
    }

    private MatchLive parseMatch(JsonNode item) {
        try {
            Long id = item.path("id").asLong(0);
            if (id == 0) return null;

            String kickoff = item.path("kickoff_utc").asText(null);
            Instant dateHeure = null;
            if (kickoff != null && !kickoff.isBlank()) {
                dateHeure = Instant.parse(kickoff);
            }

            // L'API WC2026 renvoie "home_team_code" et "away_team_code" (pas "home_code"/"away_code")
            String homeCode = item.path("home_team_code").asText(null);
            String awayCode = item.path("away_team_code").asText(null);

            // Attention : NE PAS utiliser un ternaire direct entre `asLong()` (long primitif)
            // et `Optional.orElse(null)` (Long), sinon Java deballe le Long et NPE quand null.
            Long homeId = resoudreEquipeId(item.path("home_team_id"), homeCode);
            Long awayId = resoudreEquipeId(item.path("away_team_id"), awayCode);

            String status = item.path("status").asText("scheduled");
            String statutCourt = mapperStatut(status);

            Integer scoreDom = item.path("home_score").isNull() || item.path("home_score").isMissingNode()
                    ? null : item.path("home_score").asInt();
            Integer scoreExt = item.path("away_score").isNull() || item.path("away_score").isMissingNode()
                    ? null : item.path("away_score").asInt();

            String round = item.path("round").asText("group");
            String phase = "group".equalsIgnoreCase(round) ? "Group Stage" : round;

            String groupName = item.path("group_name").asText(null);
            if (groupName != null && groupName.isBlank()) groupName = null;

            // Drapeaux : l'API fournit home_team_flag / away_team_flag directement.
            // On utilise ceux-la en priorite, sinon fallback sur le logo stocke par code.
            String homeFlag = item.path("home_team_flag").asText(null);
            if (homeFlag == null || homeFlag.isBlank()) homeFlag = logoEquipe(homeCode);
            String awayFlag = item.path("away_team_flag").asText(null);
            if (awayFlag == null || awayFlag.isBlank()) awayFlag = logoEquipe(awayCode);

            return MatchLive.builder()
                    .id(id)
                    .dateHeure(dateHeure)
                    .phase(phase)
                    .groupe(groupName)
                    .statut(statutCourt)
                    .statutLong(status)
                    .minute(null)
                    .equipeDomicileId(homeId)
                    .equipeDomicileNom(item.path("home_team").asText())
                    .equipeDomicileLogo(homeFlag)
                    .scoreDomicile(scoreDom)
                    .equipeExterieurId(awayId)
                    .equipeExterieurNom(item.path("away_team").asText())
                    .equipeExterieurLogo(awayFlag)
                    .scoreExterieur(scoreExt)
                    .stadeNom(item.path("stadium").asText(null))
                    // L'API renvoie "stadium_city" (pas "city")
                    .stadeVille(item.path("stadium_city").asText(null))
                    .derniereMiseAJour(Instant.now())
                    .evenements(new ArrayList<>())
                    .build();

        } catch (Exception e) {
            log.warn("Match ignore (parse error) : {}", e.getMessage());
            return null;
        }
    }

    private String mapperStatut(String wc2026Status) {
        if (wc2026Status == null) return "NS";
        return switch (wc2026Status.toLowerCase()) {
            case "scheduled" -> "NS";
            case "live"      -> "LIVE";
            case "completed" -> "FT";
            default          -> wc2026Status.toUpperCase();
        };
    }

    private String logoEquipe(String code) {
        if (code == null) return null;
        return equipeRepository.findFirstByCodeOrderByIdAsc(code).map(Equipe::getLogo).orElse(null);
    }

    /**
     * Resout l'id d'une equipe a partir du noeud JSON (prioritaire si present et numerique)
     * ou a defaut du code equipe. Retourne null si aucune des deux sources ne fournit un id,
     * sans jamais declencher de NullPointerException (cf. piege d'unboxing long/Long).
     */
    private Long resoudreEquipeId(JsonNode idNode, String code) {
        if (idNode != null && idNode.isNumber()) {
            return idNode.asLong();
        }
        if (code == null) return null;
        return equipeRepository.findFirstByCodeOrderByIdAsc(code)
                .map(Equipe::getId)
                .orElse(null);
    }
}
