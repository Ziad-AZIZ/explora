package com.worldcup2026.calendrierservice.model.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Un match de la CDM 2026 avec son etat courant.
 * Stocke en MongoDB car :
 *   - les evenements (buts, cartons) sont une liste imbriquee qui grandit
 *   - le schema varie selon le type de match (prolongations, tirs au but...)
 *   - les donnees changent toutes les 15-30 secondes pendant un match live
 */
@Document(collection = "match_live")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MatchLive {

    /** ID fixture d'API-Football */
    @Id
    private Long id;

    private Instant dateHeure;

    /** Phase : "Group Stage", "Round of 32", "Quarter-finals", etc. */
    private String phase;

    /** "A", "B", ... ou null pour les matchs a elimination directe */
    private String groupe;

    /** Statut : "NS" (not started), "1H", "HT", "2H", "FT", "LIVE", etc. */
    private String statut;
    private String statutLong;

    /** Minute courante si le match est en cours */
    private Integer minute;

    // ----- Equipes et scores (denormalises pour simplicite) -----
    private Long equipeDomicileId;
    private String equipeDomicileNom;
    private String equipeDomicileLogo;
    private Integer scoreDomicile;

    private Long equipeExterieurId;
    private String equipeExterieurNom;
    private String equipeExterieurLogo;
    private Integer scoreExterieur;

    // ----- Stade -----
    private String stadeNom;
    private String stadeVille;

    // ----- Evenements du match (liste imbriquee) -----
    private List<Evenement> evenements = new ArrayList<>();

    private Instant derniereMiseAJour;

    /**
     * Un evenement pendant un match : but, carton, remplacement...
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Evenement {
        private Integer minute;
        private String type;         // "Goal", "Card", "subst"
        private String detail;       // "Normal Goal", "Yellow Card", ...
        private String joueurNom;
        private String equipeNom;
    }
}
