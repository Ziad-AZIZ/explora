package com.worldcup2026.calendrierservice.dto;

import lombok.*;

import java.time.Instant;
import java.util.List;

/**
 * DTO d'exposition d'un match vers le frontend.
 *
 * Remplace l'exposition directe de l'entite MongoDB {@code MatchLive} : cela
 * decouple le modele de persistance du contrat d'API et permet d'evoluer le
 * schema Mongo sans casser le front.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MatchDTO {

    private Long id;
    private Instant dateHeure;

    /** Ex: "Group Stage", "Round of 16", "Quarter-finals". */
    private String phase;

    /** Nom du groupe (A..L) ou null pour les matchs a elimination directe. */
    private String groupe;

    /** Statut court : NS, LIVE, FT... */
    private String statut;
    private String statutLong;
    private Integer minute;

    // ----- Equipe domicile -----
    private Long equipeDomicileId;
    private String equipeDomicileNom;
    private String equipeDomicileLogo;
    private Integer scoreDomicile;

    // ----- Equipe exterieur -----
    private Long equipeExterieurId;
    private String equipeExterieurNom;
    private String equipeExterieurLogo;
    private Integer scoreExterieur;

    // ----- Stade -----
    private String stadeNom;
    private String stadeVille;

    /** Evenements marquants du match (buts, cartons, etc.). */
    private List<EvenementDTO> evenements;

    /**
     * DTO imbrique pour un evenement (but, carton, remplacement).
     */
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EvenementDTO {
        private Integer minute;
        private String type;
        private String detail;
        private String joueurNom;
        private String equipeNom;
    }
}
