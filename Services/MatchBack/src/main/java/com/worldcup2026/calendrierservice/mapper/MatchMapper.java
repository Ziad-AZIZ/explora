package com.worldcup2026.calendrierservice.mapper;

import com.worldcup2026.calendrierservice.dto.MatchDTO;
import com.worldcup2026.calendrierservice.model.mongo.MatchLive;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class MatchMapper {

    public MatchDTO toDto(MatchLive match) {
        if (match == null) return null;

        List<MatchDTO.EvenementDTO> evenementsDto = (match.getEvenements() == null)
                ? Collections.emptyList()
                : match.getEvenements().stream()
                  .map(this::toEvenementDto)
                  .toList();

        return MatchDTO.builder()
                .id(match.getId())
                .dateHeure(match.getDateHeure())
                .phase(match.getPhase())
                .groupe(match.getGroupe())
                .statut(match.getStatut())
                .statutLong(match.getStatutLong())
                .minute(match.getMinute())
                .equipeDomicileId(match.getEquipeDomicileId())
                .equipeDomicileNom(match.getEquipeDomicileNom())
                .equipeDomicileLogo(match.getEquipeDomicileLogo())
                .scoreDomicile(match.getScoreDomicile())
                .equipeExterieurId(match.getEquipeExterieurId())
                .equipeExterieurNom(match.getEquipeExterieurNom())
                .equipeExterieurLogo(match.getEquipeExterieurLogo())
                .scoreExterieur(match.getScoreExterieur())
                .stadeNom(match.getStadeNom())
                .stadeVille(match.getStadeVille())
                .evenements(evenementsDto)
                .build();
    }

    private MatchDTO.EvenementDTO toEvenementDto(MatchLive.Evenement evenement) {
        if (evenement == null) return null;
        return MatchDTO.EvenementDTO.builder()
                .minute(evenement.getMinute())
                .type(evenement.getType())
                .detail(evenement.getDetail())
                .joueurNom(evenement.getJoueurNom())
                .equipeNom(evenement.getEquipeNom())
                .build();
    }
}