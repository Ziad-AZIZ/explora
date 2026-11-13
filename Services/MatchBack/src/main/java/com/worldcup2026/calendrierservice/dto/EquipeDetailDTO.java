package com.worldcup2026.calendrierservice.dto;

import lombok.*;

import java.util.List;

/**
 * DTO de detail d'une equipe : regroupe toutes les infos affichees sur la
 * page "Detail equipe" du frontend.
 *
 * Ne contient que des DTOs (jamais d'entites) pour garantir la separation
 * entre le modele de persistance et le contrat d'API.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipeDetailDTO {

    /** Infos de base de l'equipe (nom, drapeau, groupe...). */
    private EquipeDTO infos;

    /** Classement complet du groupe de l'equipe (utile pour afficher le contexte). */
    private List<ClassementDTO> classementGroupe;

    /** Matchs joues et a venir de l'equipe, tries par date. */
    private List<MatchDTO> matchs;

    /** Stats agregees de l'equipe (bilan V/N/D, buts pour/contre...). */
    private StatsEquipeDTO stats;
}
