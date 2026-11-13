package com.maroc2030.model;

import jakarta.persistence.*;

@Entity
@Table(name = "restaurants")
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String city;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String priceRange;  // $, $$, $$$, $$$$

    private Double rating;

    private String address;

    private String phone;

    private String email;

    @Column(columnDefinition = "TEXT")
    private String imageUrl;

    private String cuisine;  // Marocaine, Française, Italienne, etc.

    @Column(columnDefinition = "TEXT")
    private String menu;

    private String openingHours;

    private Boolean available = true;

    private Double latitude;

    private Double longitude;

    private Integer capacity;

    private Boolean hasDelivery = false;

    private Boolean hasReservation = true;

    // Constructeurs
    public Restaurant() {
    }

    public Restaurant(Long id, String name, String city, String description,
                      String priceRange, Double rating, String address, String phone,
                      String email, String imageUrl, String cuisine, String menu,
                      String openingHours, Boolean available, Double latitude,
                      Double longitude, Integer capacity, Boolean hasDelivery,
                      Boolean hasReservation) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.description = description;
        this.priceRange = priceRange;
        this.rating = rating;
        this.address = address;
        this.phone = phone;
        this.email = email;
        this.imageUrl = imageUrl;
        this.cuisine = cuisine;
        this.menu = menu;
        this.openingHours = openingHours;
        this.available = available;
        this.latitude = latitude;
        this.longitude = longitude;
        this.capacity = capacity;
        this.hasDelivery = hasDelivery;
        this.hasReservation = hasReservation;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPriceRange() { return priceRange; }
    public void setPriceRange(String priceRange) { this.priceRange = priceRange; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getCuisine() { return cuisine; }
    public void setCuisine(String cuisine) { this.cuisine = cuisine; }

    public String getMenu() { return menu; }
    public void setMenu(String menu) { this.menu = menu; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public Boolean getAvailable() { return available; }
    public void setAvailable(Boolean available) { this.available = available; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Boolean getHasDelivery() { return hasDelivery; }
    public void setHasDelivery(Boolean hasDelivery) { this.hasDelivery = hasDelivery; }

    public Boolean getHasReservation() { return hasReservation; }
    public void setHasReservation(Boolean hasReservation) { this.hasReservation = hasReservation; }
}