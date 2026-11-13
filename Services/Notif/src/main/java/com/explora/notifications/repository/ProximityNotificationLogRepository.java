package com.explora.notifications.repository;

import com.explora.notifications.entity.ProximityNotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Optional;

public interface ProximityNotificationLogRepository extends JpaRepository<ProximityNotificationLog, Long> {
    Optional<ProximityNotificationLog> findFirstByUserIdAndPoiIdAndNotifiedAtAfter(
            Long userId, Long poiId, LocalDateTime since);
}