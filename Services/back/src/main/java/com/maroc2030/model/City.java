package com.maroc2030.model;

import jakarta.persistence.*;

@Entity
@Table(name = "cities")
public class City {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String stadium;

    private Integer capacity;

    private String emoji;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String facts;

    @Column(columnDefinition = "TEXT")
    private String highlights;

    private Double latitude;

    private Double longitude;

    // Constructeurs
    public City() {
    }

    public City(Long id, String name, String description, String stadium, Integer capacity,
                String emoji, String imageUrl, String facts, String highlights,
                Double latitude, Double longitude) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.stadium = stadium;
        this.capacity = capacity;
        this.emoji = emoji;
        this.imageUrl = imageUrl;
        this.facts = facts;
        this.highlights = highlights;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStadium() {
        return stadium;
    }

    public void setStadium(String stadium) {
        this.stadium = stadium;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getEmoji() {
        return emoji;
    }

    public void setEmoji(String emoji) {
        this.emoji = emoji;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getFacts() {
        return facts;
    }

    public void setFacts(String facts) {
        this.facts = facts;
    }

    public String getHighlights() {
        return highlights;
    }

    public void setHighlights(String highlights) {
        this.highlights = highlights;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}