package com.worldcup2026.calendrierservice.service.sync;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.worldcup2026.calendrierservice.model.mongo.MatchLive;
import com.worldcup2026.calendrierservice.repository.mongo.MatchLiveRepository;
import com.worldcup2026.calendrierservice.service.api.IExternalApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Service de synchronisation des matchs depuis l'API WC2026 vers MongoDB.
 *
 * Responsabilite unique (SRP) : recuperer la payload /matches, parser chaque
 * entree via {@link MatchParser}, et persister en Mongo. Ne modifie ni les
 * equipes ni les classements.
 *
 * Depend de : {@link EquipeSyncService} (les ids d'equipes sont resolus par code).
 */
@Service
public class MatchSyncService implements ISyncService {

    private static final Logger log = LoggerFactory.getLogger(MatchSyncService.class);

    private final IExternalApiClient externalApi;
    private final MatchLiveRepository matchRepository;
    private final MatchParser matchParser;
    private final ObjectMapper jsonMapper = new ObjectMapper();

    public MatchSyncService(IExternalApiClient externalApi,
                            MatchLiveRepository matchRepository,
                            MatchParser matchParser) {
        this.externalApi = externalApi;
        this.matchRepository = matchRepository;
        this.matchParser = matchParser;
    }

    @Override
    public String domaine() {
        return "matchs";
    }

    @Override
    public void synchroniser() {
        log.info("Sync matchs depuis WC2026 API /matches...");
        JsonNode matches = recupererPayloadMatches();
        if (matches == null) return;

        int count = 0;
        for (JsonNode item : matches) {
            MatchLive match = matchParser.parser(item);
            if (match == null) continue;
            matchRepository.save(match);
            count++;
        }
        log.info("Sync matchs OK - {} matchs", count);
    }

    /** Recupere et parse la payload /matches, retourne null si inexploitable. */
    private JsonNode recupererPayloadMatches() {
        String json = externalApi.getMatches();
        if (json == null || json.isBlank()) {
            log.warn("Reponse /matches vide ou indisponible");
            return null;
        }

        JsonNode root;
        try {
            root = jsonMapper.readTree(json);
        } catch (Exception e) {
            log.error("Impossible de parser /matches : {}", e.getMessage());
            return null;
        }

        JsonNode matches = root.isArray() ? root : root.path("data");
        if (!matches.isArray()) {
            log.warn("Reponse /matches invalide (pas un tableau)");
            return null;
        }
        return matches;
    }
}
