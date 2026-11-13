package com.worldcup2026.calendrierservice.service.sync;

import com.fasterxml.jackson.databind.JsonNode;
import com.worldcup2026.calendrierservice.model.mongo.MatchLive;
import com.worldcup2026.calendrierservice.model.postgres.Equipe;
import com.worldcup2026.calendrierservice.repository.postgres.EquipeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.ArrayList;

/**
 * Composant specialise dans le parsing d'un noeud JSON "match" de l'API WC2026
 * vers l'entite {@link MatchLive}.
 *
 * Extrait de l'ancien {@code SynchronisationService} pour respecter le SRP :
 * une classe = une raison de changer. Si le schema JSON de l'API evolue, SEULE
 * cette classe est modifiee.
 */
@Component
public class MatchParser {

    private static final Logger log = LoggerFactory.getLogger(MatchParser.class);

    private final EquipeRepository equipeRepository;

    public MatchParser(EquipeRepository equipeRepository) {
        this.equipeRepository = equipeRepository;
    }

    /**
     * Convertit un noeud JSON en entite MatchLive prete a etre sauvegardee.
     * Retourne null si le parsing echoue ou si le match est malforme.
     */
    public MatchLive parser(JsonNode item) {
        try {
            Long id = item.path("id").asLong(0);
            if (id == 0) return null;

            String homeCode = item.path("home_team_code").asText(null);
            String awayCode = item.path("away_team_code").asText(null);

            // Resolution type-safe des ids (piege d'unboxing Long/long evite).
            Long homeId = resoudreEquipeId(item.path("home_team_id"), homeCode);
            Long awayId = resoudreEquipeId(item.path("away_team_id"), awayCode);

            String statutApi = item.path("status").asText("scheduled");

            return MatchLive.builder()
                    .id(id)
                    .dateHeure(parserDate(item.path("kickoff_utc").asText(null)))
                    .phase(resoudrePhase(item.path("round").asText("group")))
                    .groupe(nullableText(item.path("group_name").asText(null)))
                    .statut(mapperStatut(statutApi))
                    .statutLong(statutApi)
                    .minute(null)
                    .equipeDomicileId(homeId)
                    .equipeDomicileNom(item.path("home_team").asText())
                    .equipeDomicileLogo(resoudreDrapeau(item.path("home_team_flag"), homeCode))
                    .scoreDomicile(parserScore(item.path("home_score")))
                    .equipeExterieurId(awayId)
                    .equipeExterieurNom(item.path("away_team").asText())
                    .equipeExterieurLogo(resoudreDrapeau(item.path("away_team_flag"), awayCode))
                    .scoreExterieur(parserScore(item.path("away_score")))
                    .stadeNom(item.path("stadium").asText(null))
                    .stadeVille(item.path("stadium_city").asText(null))
                    .derniereMiseAJour(Instant.now())
                    .evenements(new ArrayList<>())
                    .build();

        } catch (Exception e) {
            log.warn("Match ignore (erreur de parsing) : {}", e.getMessage());
            return null;
        }
    }

    // =========================================================================
    // Helpers prives
    // =========================================================================

    /** Parse une date ISO-8601 UTC, retourne null si la chaine est vide ou invalide. */
    private Instant parserDate(String iso) {
        if (iso == null || iso.isBlank()) return null;
        return Instant.parse(iso);
    }

    /** Retourne null si le noeud JSON est null ou manquant, sinon la valeur int. */
    private Integer parserScore(JsonNode node) {
        if (node == null || node.isNull() || node.isMissingNode()) return null;
        return node.asInt();
    }

    /** "group" -> "Group Stage", autre round -> tel quel. */
    private String resoudrePhase(String round) {
        return "group".equalsIgnoreCase(round) ? "Group Stage" : round;
    }

    /** Retourne null si la chaine est vide, la chaine sinon. */
    private String nullableText(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }

    /** Mappe le statut texte de l'API WC2026 vers notre code court standard. */
    private String mapperStatut(String statutApi) {
        if (statutApi == null) return "NS";
        return switch (statutApi.toLowerCase()) {
            case "scheduled" -> "NS";
            case "live"      -> "LIVE";
            case "completed" -> "FT";
            default          -> statutApi.toUpperCase();
        };
    }

    /**
     * Drapeau de l'equipe : priorite a la valeur fournie par l'API, sinon fallback
     * sur le logo stocke en BDD pour cette equipe (cherche par code).
     */
    private String resoudreDrapeau(JsonNode flagNode, String code) {
        String apiFlag = flagNode.asText(null);
        if (apiFlag != null && !apiFlag.isBlank()) return apiFlag;

        if (code == null) return null;
        return equipeRepository.findFirstByCodeOrderByIdAsc(code)
                .map(Equipe::getLogo)
                .orElse(null);
    }

    /**
     * Resout l'id d'une equipe depuis le noeud JSON (prioritaire si present et
     * numerique), ou a defaut depuis le code en BDD.
     *
     * IMPORTANT : le type de retour doit rester {@code Long} (objet) et non
     * {@code long} (primitif), sinon Java deballe implicitement le resultat de
     * {@code Optional.orElse(null)} et leve NullPointerException.
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
