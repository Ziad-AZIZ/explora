package com.explora.notifications.repository;

import com.explora.notifications.entity.ScheduledNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface ScheduledNotificationRepository extends JpaRepository<ScheduledNotification, Long> {

    // Trouve toutes les notifs pas encore envoyées dont l'heure est passée
    List<ScheduledNotification> findBySentFalseAndScheduledForBefore(LocalDateTime now);

    // Trouve toutes les notifs planifiées d'un utilisateur
    List<ScheduledNotification> findByUserIdOrderByScheduledForAsc(Long userId);
}