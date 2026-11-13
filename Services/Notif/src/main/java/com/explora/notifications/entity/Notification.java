package com.explora.notifications.entity;

import com.explora.notifications.enums.NotificationType;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, length = 500)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private NotificationType type;

    @Column(name = "is_read")
    private Boolean read = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}