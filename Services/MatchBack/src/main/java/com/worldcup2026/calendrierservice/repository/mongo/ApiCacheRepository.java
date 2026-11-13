package com.worldcup2026.calendrierservice.repository.mongo;

import com.worldcup2026.calendrierservice.model.mongo.ApiCache;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ApiCacheRepository extends MongoRepository<ApiCache, String> {
}
