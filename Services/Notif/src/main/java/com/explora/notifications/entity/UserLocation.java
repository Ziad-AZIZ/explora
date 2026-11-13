package com.explora.notifications.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_locations")
@Data
public class UserLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 100)
    private String city;  // déduite ou envoyée par le mobile

    @Column(length = 5)
    private String language;  // pour savoir dans quelle langue notifier

    private LocalDateTime updatedAt = LocalDateTime.now();
}