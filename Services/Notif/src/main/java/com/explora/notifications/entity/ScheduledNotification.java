package com.explora.notifications.entity;

import com.explora.notifications.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "scheduled_notifications")
@Data
public class ScheduledNotification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private NotificationType type;

    @Column(nullable = false)
    private LocalDateTime scheduledFor;  // Quand envoyer

    @Column(nullable = false)
    private Boolean sent = false;

    @Column
    private LocalDateTime sentAt;  // Quand ça a été réellement envoyé

    private LocalDateTime createdAt = LocalDateTime.now();
}