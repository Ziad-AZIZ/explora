package com.explora.notifications.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "device_tokens")
@Data  // Lombok : génère getters/setters automatiquement
public class DeviceToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;  // id de l'utilisateur

    @Column(nullable = false, length = 500)
    private String token;  // le token FCM du téléphone

    @Column(length = 20)
    private String platform;  // "android" ou "ios"

    @Column(length = 5)
    private String language;  // "fr", "en", "ar"

    private LocalDateTime createdAt = LocalDateTime.now();
}