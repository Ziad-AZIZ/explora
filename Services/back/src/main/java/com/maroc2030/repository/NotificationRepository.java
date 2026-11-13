package com.maroc2030.repository;

import com.maroc2030.model.Notification;
import com.maroc2030.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByType(NotificationType type);
    List<Notification> findByOrderByCreatedAtDesc();
}