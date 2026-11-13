package com.worldcup2026.calendrierservice.controller;

import com.worldcup2026.calendrierservice.dto.MatchDTO;
import com.worldcup2026.calendrierservice.service.IMatchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/wc2026/matchs")
public class MatchController {

    private final IMatchService matchService;

    public MatchController(IMatchService matchService) {
        this.matchService = matchService;
    }

    @GetMapping
    public List<MatchDTO> getAllMatchs() {
        return matchService.findAll();
    }

    @GetMapping("/{id}")
    public MatchDTO getMatchById(@PathVariable Long id) {
        return matchService.findById(id);
    }

    @GetMapping("/phase/{phase}")
    public List<MatchDTO> getMatchsByPhase(@PathVariable String phase) {
        return matchService.findByPhase(phase);
    }

    @GetMapping("/groupe/{groupe}")
    public List<MatchDTO> getMatchsByGroupe(@PathVariable String groupe) {
        return matchService.findByGroupe(groupe);
    }

    @GetMapping("/live")
    public List<MatchDTO> getMatchsLive() {
        return matchService.findLive();
    }
}