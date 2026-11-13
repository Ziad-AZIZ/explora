package com.worldcup2026.calendrierservice.service.sync;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Orchestrateur de synchronisation (pattern Facade).
 *
 * Compose les trois services de sync specialises et les execute dans le bon
 * ordre (equipes -> classements -> matchs) car :
 *  - les classements referencent les equipes (FK)
 *  - les matchs resolvent l'id par code equipe
 *
 * SOLID :
 *  - DIP : depend de la liste d'interfaces {@link ISyncService}, pas des classes.
 *          Si on ajoute un service (ex: StadeSyncService qui implemente ISyncService),
 *          il sera automatiquement injecte par Spring et inclus dans l'ordre.
 *  - OCP : ajouter un domaine = creer une classe, aucune modification de celle-ci.
 *
 * NB : l'ordre d'execution est CRITIQUE. On ne peut pas utiliser l'injection
 * automatique de la {@code List<ISyncService>} (ordre non garanti). On passe
 * donc par injection nominative des 3 services.
 */
@Component
public class SyncOrchestrator {

    private static final Logger log = LoggerFactory.getLogger(SyncOrchestrator.class);

    /** Delai entre deux syncs periodiques (10 minutes). */
    private static final long DELAI_SYNC_MS = 600_000L;

    /**
     * Services executes dans l'ordre fourni. L'ordre est impose ici car il
     * correspond aux dependances fonctionnelles entre les domaines.
     */
    private final List<ISyncService> servicesOrdonnes;

    public SyncOrchestrator(EquipeSyncService equipeSync,
                            ClassementSyncService classementSync,
                            MatchSyncService matchSync) {
        // Ordre impose : equipes d'abord (referencees par tout le reste),
        // puis classements (dependent des equipes),
        // puis matchs (resolvent les ids d'equipes par code).
        this.servicesOrdonnes = List.of(equipeSync, classementSync, matchSync);
    }

    /** Sync executee au demarrage de l'application. */
    @PostConstruct
    public void synchroniserAuDemarrage() {
        log.info("=== Synchronisation initiale WC2026 API ===");
        executerTousLesServices();
    }

    /** Sync executee periodiquement (toutes les 10 minutes apres un premier delai de 10 min). */
    @Scheduled(fixedDelay = DELAI_SYNC_MS, initialDelay = DELAI_SYNC_MS)
    public void synchroniserPeriodiquement() {
        log.info("=== Synchronisation periodique ===");
        executerTousLesServices();
    }

    /**
     * Execute chaque service dans l'ordre. Une erreur sur un service n'empeche
     * pas les suivants de tourner (chaque sync est independante a ce niveau).
     */
    private void executerTousLesServices() {
        for (ISyncService service : servicesOrdonnes) {
            try {
                service.synchroniser();
            } catch (Exception e) {
                log.warn("Sync du domaine '{}' en echec : {}", service.domaine(), e.getMessage());
            }
        }
    }
}
