package com.worldcup2026.calendrierservice.service;

import com.worldcup2026.calendrierservice.dto.ClassementDTO;
import com.worldcup2026.calendrierservice.dto.EquipeDTO;
import com.worldcup2026.calendrierservice.dto.EquipeDetailDTO;
import com.worldcup2026.calendrierservice.dto.MatchDTO;
import com.worldcup2026.calendrierservice.dto.StatsEquipeDTO;
import com.worldcup2026.calendrierservice.exception.ResourceNotFoundException;
import com.worldcup2026.calendrierservice.mapper.ClassementMapper;
import com.worldcup2026.calendrierservice.mapper.EquipeMapper;
import com.worldcup2026.calendrierservice.mapper.MatchMapper;
import com.worldcup2026.calendrierservice.model.postgres.Equipe;
import com.worldcup2026.calendrierservice.repository.mongo.MatchLiveRepository;
import com.worldcup2026.calendrierservice.repository.postgres.ClassementRepository;
import com.worldcup2026.calendrierservice.repository.postgres.EquipeRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * Implementation du service de gestion des equipes.
 *
 * Agrege les donnees provenant de plusieurs repositories (equipe, classement,
 * match) pour construire la vue detaillee exposee a la page "Detail equipe"
 * du frontend.
 */
@Service
public class EquipeServiceImpl implements IEquipeService {

    private final EquipeRepository equipeRepository;
    private final ClassementRepository classementRepository;
    private final MatchLiveRepository matchRepository;
    private final EquipeMapper equipeMapper;
    private final ClassementMapper classementMapper;
    private final MatchMapper matchMapper;

    public EquipeServiceImpl(EquipeRepository equipeRepository,
                             ClassementRepository classementRepository,
                             MatchLiveRepository matchRepository,
                             EquipeMapper equipeMapper,
                             ClassementMapper classementMapper,
                             MatchMapper matchMapper) {
        this.equipeRepository = equipeRepository;
        this.classementRepository = classementRepository;
        this.matchRepository = matchRepository;
        this.equipeMapper = equipeMapper;
        this.classementMapper = classementMapper;
        this.matchMapper = matchMapper;
    }

    @Override
    public List<EquipeDTO> findAll() {
        return equipeRepository.findAll().stream()
                .map(equipeMapper::toDto)
                .sorted(Comparator.comparing(EquipeDTO::getNom))
                .toList();
    }

    @Override
    public EquipeDetailDTO findDetailById(Long id) {
        Equipe equipe = equipeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipe", id));

        // Classement complet du groupe de l'equipe (pour afficher le contexte).
        List<ClassementDTO> classementGroupe = recupererClassementGroupe(equipe);

        // Matchs de l'equipe (domicile ET exterieur) tries par date.
        List<MatchDTO> matchs = matchRepository
                .findByEquipeDomicileIdOrEquipeExterieurIdOrderByDateHeureAsc(id, id)
                .stream()
                .map(matchMapper::toDto)
                .toList();

        // Stats agregees (peut etre null si pas encore de classement).
        StatsEquipeDTO stats = classementRepository.findByEquipe_Id(id)
                .map(classementMapper::toStats)
                .orElse(null);

        return EquipeDetailDTO.builder()
                .infos(equipeMapper.toDto(equipe))
                .classementGroupe(classementGroupe)
                .matchs(matchs)
                .stats(stats)
                .build();
    }

    /** Renvoie le classement complet du groupe de l'equipe, ou liste vide si sans groupe. */
    private List<ClassementDTO> recupererClassementGroupe(Equipe equipe) {
        return Optional.ofNullable(equipe.getGroupeNom())
                .map(nom -> classementRepository
                        .findByEquipe_Groupe_NomOrderByPositionAsc(nom)
                        .stream()
                        .map(classementMapper::toDto)
                        .toList())
                .orElse(List.of());
    }
}
