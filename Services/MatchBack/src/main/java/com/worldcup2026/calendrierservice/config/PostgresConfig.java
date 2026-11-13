package com.worldcup2026.calendrierservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Active la detection des repos JPA uniquement dans le package postgres.
 * Evite les conflits avec les repositories Mongo.
 */
@Configuration
@EnableJpaRepositories(
    basePackages = "com.worldcup2026.calendrierservice.repository.postgres"
)
public class PostgresConfig {
}
