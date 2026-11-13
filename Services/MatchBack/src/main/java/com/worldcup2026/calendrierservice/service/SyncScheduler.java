package com.worldcup2026.calendrierservice.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SyncScheduler {

    private static final Logger log = LoggerFactory.getLogger(SyncScheduler.class);

    private final SynchronisationService syncService;

    public SyncScheduler(SynchronisationService syncService) {
        this.syncService = syncService;
    }

    @PostConstruct
    public void syncAuDemarrage() {
        log.info("=== Synchronisation initiale WC2026 API ===");
        try {
            // 1) Equipes d'abord : elles sont referencees par classements et matchs.
            syncService.synchroniserEquipesSeules();
            // 2) Classements : depend des equipes (init a 0 si /standings == 404).
            syncService.synchroniserClassements();
            // 3) Matchs : depend des equipes pour resoudre les IDs par code.
            syncService.synchroniserMatchs();
        } catch (Exception e) {
            log.warn("Sync initiale a echoue (normal si pas de cle API valide) : {}", e.getMessage());
        }
    }

    @Scheduled(fixedDelay = 600_000L, initialDelay = 600_000L)
    public void syncPeriodique() {
        log.info("=== Synchronisation periodique ===");
        try {
            syncService.synchroniserEquipesSeules();
            syncService.synchroniserClassements();
            syncService.synchroniserMatchs();
        } catch (Exception e) {
            log.warn("Sync periodique a echoue : {}", e.getMessage());
        }
    }
}
