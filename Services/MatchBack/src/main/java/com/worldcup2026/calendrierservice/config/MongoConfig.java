package com.worldcup2026.calendrierservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * Active la detection des repos Mongo uniquement dans le package mongo.
 * Evite les conflits avec les repositories JPA (Postgres).
 */
@Configuration
@EnableMongoRepositories(
    basePackages = "com.worldcup2026.calendrierservice.repository.mongo"
)
public class MongoConfig {
}
