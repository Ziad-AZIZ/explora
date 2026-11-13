package com.worldcup2026.calendrierservice.controller;

import com.worldcup2026.calendrierservice.dto.ClassementDTO;
import com.worldcup2026.calendrierservice.dto.GroupeClassementDTO;
import com.worldcup2026.calendrierservice.service.IClassementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller REST pour les classements de la CDM 2026.
 *
 * CORS gere de maniere centralisee par {@code WebConfig} : plus de
 * {@code @CrossOrigin} ici.
 */
@RestController
@RequestMapping("/api/wc2026/classements")
public class ClassementController {

    private final IClassementService classementService;

    public ClassementController(IClassementService classementService) {
        this.classementService = classementService;
    }

    /** GET /api/wc2026/classements — classements regroupes par groupe (A..L). */
    @GetMapping
    public List<GroupeClassementDTO> getTousLesClassements() {
        return classementService.findAllGroupedByGroupe();
    }

    /** GET /api/wc2026/classements/{nomGroupe} — classement d'un groupe donne. */
    @GetMapping("/{nomGroupe}")
    public List<ClassementDTO> getClassementGroupe(@PathVariable String nomGroupe) {
        return classementService.findByGroupe(nomGroupe);
    }
}
