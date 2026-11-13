package com.explora.notifications.entity;

import com.explora.notifications.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "notification_templates",
        uniqueConstraints = @UniqueConstraint(columnNames = {"type", "language"}))
@Data
public class NotificationTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @Column(nullable = false, length = 5)
    private String language;  // "fr", "en", "ar"

    @Column(nullable = false, length = 200)
    private String titleTemplate;   // ex: "🏟️ {{teamA}} vs {{teamB}} demain !"

    @Column(nullable = false, length = 500)
    private String bodyTemplate;    // ex: "N'oublie pas ! Match à {{time}} au {{stadium}}"
}