package com.worldcup2026.calendrierservice.controller;

import com.worldcup2026.calendrierservice.dto.EquipeDTO;
import com.worldcup2026.calendrierservice.dto.EquipeDetailDTO;
import com.worldcup2026.calendrierservice.service.IEquipeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller REST pour les equipes de la CDM 2026.
 *
 * CORS gere de maniere centralisee par {@code WebConfig} : plus de
 * {@code @CrossOrigin} ici.
 */
@RestController
@RequestMapping("/api/wc2026/equipes")
public class EquipeController {

    private final IEquipeService equipeService;

    public EquipeController(IEquipeService equipeService) {
        this.equipeService = equipeService;
    }

    /** GET /api/wc2026/equipes — liste de toutes les equipes qualifiees. */
    @GetMapping
    public List<EquipeDTO> getAllEquipes() {
        return equipeService.findAll();
    }

    /** GET /api/wc2026/equipes/{id} — detail d'une equipe (infos + classement + matchs + stats). */
    @GetMapping("/{id}")
    public EquipeDetailDTO getEquipeDetail(@PathVariable Long id) {
        return equipeService.findDetailById(id);
    }
}
