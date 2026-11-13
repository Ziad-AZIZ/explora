package com.projet.reservation.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String clientName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Column(nullable = false)
    private String establishmentName;

    @Column(name = "establishment_type")
    private String establishmentType; // "HOTEL" ou "RESTAURANT"

    @Column(name = "image_url", length = 2000)
    private String imageUrl;

    @Column(nullable = false)
    private Integer numberOfPeople;

    @Column(nullable = false)
    private LocalDateTime reservationDate;

    // ============================================
    // NOUVEAUX CHAMPS : Statut et confirmation
    // ============================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReservationStatus status = ReservationStatus.PENDING;

    @Column(name = "confirmed_at")
    private LocalDateTime confirmedAt;



    @Column(name = "user_id")
    private Long userId;

    // Getter et Setter
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // ============================================
    // Timestamps automatiques
    // ============================================

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ============================================
    // Constructeurs
    // ============================================

    public Reservation() {
    }

    public Reservation(String clientName, String email, String phone,
                       String establishmentName, Integer numberOfPeople,
                       LocalDateTime reservationDate) {
        this.clientName = clientName;
        this.email = email;
        this.phone = phone;
        this.establishmentName = establishmentName;
        this.numberOfPeople = numberOfPeople;
        this.reservationDate = reservationDate;
    }

    // ============================================
    // Getters et Setters
    // ============================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEstablishmentName() {
        return establishmentName;
    }

    public void setEstablishmentName(String establishmentName) {
        this.establishmentName = establishmentName;
    }

    public String getEstablishmentType() {
        return establishmentType;
    }

    public void setEstablishmentType(String establishmentType) {
        this.establishmentType = establishmentType;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public Integer getNumberOfPeople() {
        return numberOfPeople;
    }

    public void setNumberOfPeople(Integer numberOfPeople) {
        this.numberOfPeople = numberOfPeople;
    }

    public LocalDateTime getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDateTime reservationDate) {
        this.reservationDate = reservationDate;
    }

    public ReservationStatus getStatus() {
        return status;
    }

    public void setStatus(ReservationStatus status) {
        this.status = status;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }



    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // ============================================
    // Méthodes utilitaires
    // ============================================

    /**
     * Vérifie si la réservation peut être confirmée
     */
    public boolean canBeConfirmed() {
        return this.status == ReservationStatus.PENDING;
    }

    /**
     * Vérifie si la réservation est confirmée
     */
    public boolean isConfirmed() {
        return this.status == ReservationStatus.CONFIRMED;
    }



    @Override
    public String toString() {
        return "Reservation{" +
                "id=" + id +
                ", clientName='" + clientName + '\'' +
                ", email='" + email + '\'' +
                ", establishmentName='" + establishmentName + '\'' +
                ", establishmentType='" + establishmentType + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", status=" + status +
                ", reservationDate=" + reservationDate +
                '}';
    }
}