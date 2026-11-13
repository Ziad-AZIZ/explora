package com.worldcup2026.calendrierservice.service;

import com.worldcup2026.calendrierservice.dto.MatchDTO;

import java.util.List;

public interface IMatchService {

    List<MatchDTO> findAll();

    MatchDTO findById(Long id);

    List<MatchDTO> findByPhase(String phase);

    List<MatchDTO> findByGroupe(String groupe);

    List<MatchDTO> findLive();
}