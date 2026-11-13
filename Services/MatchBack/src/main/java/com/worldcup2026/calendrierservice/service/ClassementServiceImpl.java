package com.worldcup2026.calendrierservice.service;

import com.worldcup2026.calendrierservice.dto.ClassementDTO;
import com.worldcup2026.calendrierservice.dto.GroupeClassementDTO;
import com.worldcup2026.calendrierservice.mapper.ClassementMapper;
import com.worldcup2026.calendrierservice.model.postgres.Groupe;
import com.worldcup2026.calendrierservice.repository.postgres.ClassementRepository;
import com.worldcup2026.calendrierservice.repository.postgres.GroupeRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
public class ClassementServiceImpl implements IClassementService {

    private final GroupeRepository groupeRepository;
    private final ClassementRepository classementRepository;
    private final ClassementMapper classementMapper;

    public ClassementServiceImpl(GroupeRepository groupeRepository,
                                  ClassementRepository classementRepository,
                                  ClassementMapper classementMapper) {
        this.groupeRepository = groupeRepository;
        this.classementRepository = classementRepository;
        this.classementMapper = classementMapper;
    }

    @Override
    public List<GroupeClassementDTO> findAllGroupedByGroupe() {
        return groupeRepository.findAll().stream()
            .sorted(Comparator.comparing(Groupe::getNom))
            .map(g -> GroupeClassementDTO.builder()
                .nom(g.getNom())
                .classements(classementRepository
                    .findByEquipe_Groupe_NomOrderByPositionAsc(g.getNom())
                    .stream().map(classementMapper::toDto).toList())
                .build())
            .toList();
    }

    @Override
    public List<ClassementDTO> findByGroupe(String nomGroupe) {
        return classementRepository
            .findByEquipe_Groupe_NomOrderByPositionAsc(nomGroupe.toUpperCase())
            .stream().map(classementMapper::toDto).toList();
    }
}
