package com.worldcup2026.calendrierservice.service;

import com.worldcup2026.calendrierservice.model.mongo.ApiCache;
import com.worldcup2026.calendrierservice.repository.mongo.ApiCacheRepository;
import com.worldcup2026.calendrierservice.service.api.IExternalApiClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

@Service
public class Wc2026ApiService implements IExternalApiClient {

    private static final Logger log = LoggerFactory.getLogger(Wc2026ApiService.class);

    private final RestTemplate restTemplate;
    private final ApiCacheRepository apiCacheRepository;

    public Wc2026ApiService(RestTemplate restTemplate, ApiCacheRepository apiCacheRepository) {
        this.restTemplate = restTemplate;
        this.apiCacheRepository = apiCacheRepository;
    }

    @Value("${wc2026.url}")
    private String apiUrl;

    @Value("${wc2026.key}")
    private String apiKey;

    @Value("${wc2026.cache.live-seconds}")
    private long cacheLiveTtl;

    @Value("${wc2026.cache.default-seconds}")
    private long cacheDefaultTtl;

    public String getTeams() {
        return appelerAvecCache("/teams", Map.of(), "teams", cacheDefaultTtl);
    }

    public String getStandings() {
        return appelerAvecCache("/standings", Map.of(), "standings", cacheDefaultTtl);
    }

    public String getStandingsByGroup(String group) {
        return appelerAvecCache("/standings", Map.of("group", group),
                "standings_group_" + group, cacheDefaultTtl);
    }

    public String getMatches() {
        return appelerAvecCache("/matches", Map.of(), "matches_all", cacheDefaultTtl);
    }

    public String getMatchesLive() {
        return appelerAvecCache("/matches", Map.of("status", "live"),
                "matches_live", cacheLiveTtl);
    }

    public String getMatchesByTeam(String teamCode) {
        return appelerAvecCache("/matches", Map.of("team", teamCode),
                "matches_team_" + teamCode, cacheDefaultTtl);
    }

    public String getMatchesByGroup(String group) {
        return appelerAvecCache("/matches", Map.of("group", group),
                "matches_group_" + group, cacheDefaultTtl);
    }

    public String getMatchesByRound(String round) {
        return appelerAvecCache("/matches", Map.of("round", round),
                "matches_round_" + round, cacheDefaultTtl);
    }

    private String appelerAvecCache(String path, Map<String, String> params,
                                    String cleCache, long ttlSecondes) {
        Optional<ApiCache> cached = apiCacheRepository.findById(cleCache);
        if (cached.isPresent() && cached.get().estValide()) {
            log.debug("CACHE HIT : {}", cleCache);
            return cached.get().getContenuJson();
        }

        log.info("CACHE MISS : {} -> appel WC2026 API", cleCache);
        String json = appelerApi(path, params, cleCache);

        if (json == null) {
            // Pas de reponse exploitable (ex: 404). On ne cache pas pour pouvoir
            // reessayer plus tard, et on remonte null a l'appelant.
            return null;
        }

        ApiCache entry = ApiCache.builder()
                .cleCache(cleCache)
                .contenuJson(json)
                .misEnCacheA(Instant.now())
                .ttlSecondes(ttlSecondes)
                .build();
        apiCacheRepository.save(entry);

        return json;
    }

    private String appelerApi(String path, Map<String, String> params, String cleCache) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(apiUrl + path);
        params.forEach(builder::queryParam);
        String url = builder.toUriString();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + apiKey);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);
            return response.getBody();
        } catch (HttpClientErrorException.NotFound e) {
            // L'endpoint n'existe pas (ex: /standings avant le debut du tournoi).
            // On remonte null pour que l'appelant puisse gerer proprement (fallback).
            log.warn("WC2026 API 404 sur [{}] - endpoint indisponible", url);
            return null;
        } catch (HttpStatusCodeException e) {
            log.error("WC2026 API erreur HTTP {} sur [{}] : {}",
                    e.getStatusCode(), url, e.getStatusText());
            return apiCacheRepository.findById(cleCache)
                    .map(ApiCache::getContenuJson)
                    .orElse(null);
        } catch (Exception e) {
            log.error("Erreur appel WC2026 API [{}] : {}", url, e.getMessage());
            return apiCacheRepository.findById(cleCache)
                    .map(ApiCache::getContenuJson)
                    .orElseThrow(() -> new RuntimeException(
                            "Impossible d'atteindre WC2026 API et pas de cache : " + e.getMessage()));
        }
    }
}
