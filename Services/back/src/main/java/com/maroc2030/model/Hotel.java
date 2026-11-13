package com.maroc2030.model;

import jakarta.persistence.*;

@Entity
@Table(name = "hotels")
public class Hotel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Double price;

    private Double rating;

    private String address;

    private String phone;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String amenities;

    private Integer distanceFromStadium;

    private Boolean available = true;

    private Double latitude;

    private Double longitude;

    private Integer stars;

    // Constructeurs
    public Hotel() {
    }

    public Hotel(Long id, String name, String city, String description, Double price,
                 Double rating, String address, String phone, String email, String imageUrl,
                 String amenities, Integer distanceFromStadium, Boolean available,
                 Double latitude, Double longitude, Integer stars) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.description = description;
        this.price = price;
        this.rating = rating;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.imageUrl = imageUrl;
        this.amenities = amenities;
        this.distanceFromStadium = distanceFromStadium;
        this.available = available;
        this.latitude = latitude;
        this.longitude = longitude;
        this.stars = stars;
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

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getAmenities() {
        return amenities;
    }

    public void setAmenities(String amenities) {
        this.amenities = amenities;
    }

    public Integer getDistanceFromStadium() {
        return distanceFromStadium;
    }

    public void setDistanceFromStadium(Integer distanceFromStadium) {
        this.distanceFromStadium = distanceFromStadium;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
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

    public Integer getStars() {
        return stars;
    }

    public void setStars(Integer stars) {
        this.stars = stars;
    }
}