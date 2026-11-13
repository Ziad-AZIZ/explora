package com.explora.notifications.repository;

import com.explora.notifications.entity.NotificationTemplate;
import com.explora.notifications.enums.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, Long> {
    Optional<NotificationTemplate> findByTypeAndLanguage(NotificationType type, String language);
}