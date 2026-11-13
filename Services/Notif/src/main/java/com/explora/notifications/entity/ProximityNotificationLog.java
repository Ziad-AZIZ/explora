package com.explora.notifications.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "proximity_notification_logs",
        indexes = @Index(columnList = "userId, poiId"))
@Data
public class ProximityNotificationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long poiId;

    @Column(nullable = false)
    private LocalDateTime notifiedAt = LocalDateTime.now();
}