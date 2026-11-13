package com.worldcup2026.calendrierservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Point d'entree du backend Coupe du Monde 2026.
 *
 * Architecture :
 *   - PostgreSQL : equipes, groupes, classements (donnees stables)
 *   - MongoDB    : matchs live, evenements, cache API (donnees volatiles)
 *   - API-Football : source temps reel (plan gratuit, 100 req/jour)
 */
@SpringBootApplication
@EnableScheduling
public class CalendrierServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CalendrierServiceApplication.class, args);
    }
}
