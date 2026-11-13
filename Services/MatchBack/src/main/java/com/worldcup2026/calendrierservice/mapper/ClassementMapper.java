package com.worldcup2026.calendrierservice.mapper;
import com.worldcup2026.calendrierservice.dto.ClassementDTO;
import com.worldcup2026.calendrierservice.dto.StatsEquipeDTO;
import com.worldcup2026.calendrierservice.model.postgres.Classement;
import org.springframework.stereotype.Component;
@Component
public class ClassementMapper {
    public ClassementDTO toDto(Classement c) {
        if (c == null) return null;
        return ClassementDTO.builder()
            .position(c.getPosition())
            .equipeId(c.getEquipe().getId())
            .equipeNom(c.getEquipe().getNom())
            .equipeLogo(c.getEquipe().getLogo())
            .matchsJoues(c.getMatchsJoues()).victoires(c.getVictoires())
            .nuls(c.getNuls()).defaites(c.getDefaites())
            .butsPour(c.getButsPour()).butsContre(c.getButsContre())
            .difference(c.getDifference()).points(c.getPoints())
            .build();
    }
    public StatsEquipeDTO toStats(Classement c) {
        return StatsEquipeDTO.builder()
            .matchsJoues(c.getMatchsJoues()).victoires(c.getVictoires())
            .nuls(c.getNuls()).defaites(c.getDefaites())
            .butsPour(c.getButsPour()).butsContre(c.getButsContre())
            .difference(c.getDifference()).points(c.getPoints())
            .build();
    }
}
