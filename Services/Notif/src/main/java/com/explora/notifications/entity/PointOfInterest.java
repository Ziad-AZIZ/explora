package com.explora.notifications.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "points_of_interest")
@Data
public class PointOfInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;          // "Médersa Bou Inania"

    @Column(length = 500)
    private String description;   // "Joyau du 14ème siècle"

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(length = 100)
    private String city;          // "Fès"

    @Column(length = 50)
    private String category;      // "monument", "museum", "fan_zone"
}