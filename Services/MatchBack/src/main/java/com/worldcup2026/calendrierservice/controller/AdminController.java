package com.worldcup2026.calendrierservice.controller;

import com.worldcup2026.calendrierservice.dto.StatusDTO;
import com.worldcup2026.calendrierservice.repository.mongo.MatchLiveRepository;
import com.worldcup2026.calendrierservice.repository.postgres.ClassementRepository;
import com.worldcup2026.calendrierservice.repository.postgres.EquipeRepository;
import com.worldcup2026.calendrierservice.repository.postgres.GroupeRepository;
import com.worldcup2026.calendrierservice.service.SynchronisationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

/**
 * Controller d'administration.
 *
 * Permet de déclencher manuellement la synchronisation et de consulter
 * l'état des bases de données.
 *
 * ATTENTION : en production, protéger ces endpoints avec Spring Security.
 *
 * SOLID :
 *  - SRP : ce controller ne fait que les opérations d'administration.
 *  - DIP : dépend des interfaces/services, pas des implémentations directes.
 */
@RestController
@RequestMapping("/api/wc2026/admin")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    private final SynchronisationService synchronisationService;
    private final EquipeRepository       equipeRepository;
    private final GroupeRepository       groupeRepository;
    private final ClassementRepository   classementRepository;
    private final MatchLiveRepository    matchLiveRepository;

    public AdminController(SynchronisationService synchronisationService,
                           EquipeRepository equipeRepository,
                           GroupeRepository groupeRepository,
                           ClassementRepository classementRepository,
                           MatchLiveRepository matchLiveRepository) {
        this.synchronisationService = synchronisationService;
        this.equipeRepository       = equipeRepository;
        this.groupeRepository       = groupeRepository;
        this.classementRepository   = classementRepository;
        this.matchLiveRepository    = matchLiveRepository;
    }

    /**
     * POST /api/wc2026/admin/sync
     * Déclenche la synchronisation complète depuis l'API externe WC2026.
     * Utile pour alimenter la BDD sans attendre le scheduler.
     */
    @PostMapping("/sync")
    public ResponseEntity<Map<String, Object>> triggerSync() {
        log.info("Synchronisation manuelle déclenchée depuis l'interface admin.");
        try {
            synchronisationService.synchroniserEquipes();
            synchronisationService.synchroniserClassements();
            synchronisationService.synchroniserMatchs();
            log.info("Synchronisation manuelle terminée avec succès.");
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Synchronisation complète réussie (équipes, classements, matchs).",
                    "timestamp", Instant.now().toString()
            ));
        } catch (Exception e) {
            log.error("Erreur lors de la synchronisation manuelle : {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Erreur : " + e.getMessage(),
                    "timestamp", Instant.now().toString()
            ));
        }
    }

    /**
     * GET /api/wc2026/admin/status
     * Retourne les statistiques actuelles des bases de données.
     */
    @GetMapping("/status")
    public ResponseEntity<StatusDTO> getStatus() {
        StatusDTO status = StatusDTO.builder()
                .nbEquipes(equipeRepository.count())
                .nbGroupes(groupeRepository.count())
                .nbMatchs(matchLiveRepository.count())
                .nbClassements(classementRepository.count())
                .derniereSynchro(Instant.now())
                .message("Backend opérationnel — PostgreSQL + MongoDB connectés.")
                .build();
        return ResponseEntity.ok(status);
    }
}
