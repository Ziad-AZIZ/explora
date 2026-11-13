package com.worldcup2026.calendrierservice.mapper;
import com.worldcup2026.calendrierservice.dto.EquipeDTO;
import com.worldcup2026.calendrierservice.model.postgres.Equipe;
import org.springframework.stereotype.Component;
/** SRP : conversion Entity -> DTO uniquement. */
@Component
public class EquipeMapper {
    private final ClassementMapper classementMapper;

    public EquipeMapper(ClassementMapper classementMapper) {
        this.classementMapper = classementMapper;
    }

    public EquipeDTO toDto(Equipe e) {
        if (e == null) return null;
        return EquipeDTO.builder()
            .id(e.getId()).nom(e.getNom()).code(e.getCode())
            .logo(e.getLogo()).confederation(e.getConfederation())
            .classementFifa(e.getClassementFifa()).groupe(e.getGroupeNom())
            .build();
    }
}
