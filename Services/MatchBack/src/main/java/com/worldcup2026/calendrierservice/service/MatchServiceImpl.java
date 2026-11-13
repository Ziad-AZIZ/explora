package com.worldcup2026.calendrierservice.service;

import com.worldcup2026.calendrierservice.dto.MatchDTO;
import com.worldcup2026.calendrierservice.exception.ResourceNotFoundException;
import com.worldcup2026.calendrierservice.mapper.MatchMapper;
import com.worldcup2026.calendrierservice.model.mongo.MatchLive;
import com.worldcup2026.calendrierservice.repository.mongo.MatchLiveRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Set;

@Service
public class MatchServiceImpl implements IMatchService {

    private static final Set<String> STATUTS_LIVE =
            Set.of("LIVE", "1H", "HT", "2H", "ET", "BT", "P");

    private static final Comparator<MatchLive> PAR_DATE = Comparator.comparing(
            MatchLive::getDateHeure,
            Comparator.nullsLast(Comparator.naturalOrder()));

    private final MatchLiveRepository matchRepository;
    private final MatchMapper matchMapper;

    public MatchServiceImpl(MatchLiveRepository matchRepository,
                            MatchMapper matchMapper) {
        this.matchRepository = matchRepository;
        this.matchMapper = matchMapper;
    }

    @Override
    public List<MatchDTO> findAll() {
        return matchRepository.findAll().stream()
                .sorted(PAR_DATE)
                .map(matchMapper::toDto)
                .toList();
    }

    @Override
    public MatchDTO findById(Long id) {
        return matchRepository.findById(id)
                .map(matchMapper::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Match", id));
    }

    @Override
    public List<MatchDTO> findByPhase(String phase) {
        return matchRepository.findByPhase(phase).stream()
                .sorted(PAR_DATE)
                .map(matchMapper::toDto)
                .toList();
    }

    @Override
    public List<MatchDTO> findByGroupe(String groupe) {
        return matchRepository.findAll().stream()
                .filter(m -> groupe.equalsIgnoreCase(m.getGroupe()))
                .sorted(PAR_DATE)
                .map(matchMapper::toDto)
                .toList();
    }

    @Override
    public List<MatchDTO> findLive() {
        return matchRepository.findAll().stream()
                .filter(m -> STATUTS_LIVE.contains(m.getStatut()))
                .sorted(PAR_DATE)
                .map(matchMapper::toDto)
                .toList();
    }
}