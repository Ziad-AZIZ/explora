package com.worldcup2026.calendrierservice.model.mongo;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Cache des reponses brutes d'API-Football.
 * Stocke en MongoDB car :
 *   - structure variable (chaque endpoint retourne un JSON different)
 *   - on stocke le JSON brut comme une String (simple et flexible)
 *   - TTL gere en lecture (pas besoin d'index TTL Mongo pour ce projet)
 */
@Document(collection = "api_cache")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ApiCache {

    /** Cle unique : ex "teams_league=1_season=2026" */
    @Id
    private String cleCache;

    /** Reponse JSON brute d'API-Football (String) */
    private String contenuJson;

    /** Moment ou l'entree a ete mise en cache */
    private Instant misEnCacheA;

    /** Duree de validite en secondes (30s pour live, 3600s pour le reste) */
    private long ttlSecondes;

    /** Renvoie true si le cache est encore valide */
    public boolean estValide() {
        if (misEnCacheA == null) return false;
        return Instant.now().isBefore(misEnCacheA.plusSeconds(ttlSecondes));
    }
}
