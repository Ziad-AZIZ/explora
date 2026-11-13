package com.worldcup2026.calendrierservice.repository.mongo;

import com.worldcup2026.calendrierservice.model.mongo.MatchLive;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MatchLiveRepository extends MongoRepository<MatchLive, Long> {

    List<MatchLive> findByPhase(String phase);

    List<MatchLive> findByStatut(String statut);

    List<MatchLive> findByEquipeDomicileIdOrEquipeExterieurIdOrderByDateHeureAsc(
            Long equipeDomicileId, Long equipeExterieurId);
}
