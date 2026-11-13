package com.projet.reservation.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

/**
 * DTO pour la création et la mise à jour des réservations
 */
public class ReservationRequestDTO {

    @NotBlank(message = "Le nom du client est obligatoire")
    private String clientName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;

    @NotBlank(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Le numéro de téléphone doit être valide")
    private String phone;

    @NotBlank(message = "Le nom de l'établissement est obligatoire")
    private String establishmentName;

    @NotBlank(message = "Le type d'établissement (HOTEL ou RESTAURANT) est obligatoire")
    private String establishmentType;

    private String imageUrl;

    @NotNull(message = "Le nombre de personnes est obligatoire")
    @Min(value = 1, message = "Le nombre de personnes doit être au moins 1")
    @Max(value = 50, message = "Le nombre de personnes ne peut pas dépasser 50")
    private Integer numberOfPeople;

    /**
     * Permet au frontend de spécifier si c'est un hôtel partenaire pour l'auto-confirmation
     */
    private Boolean isPartner = false;

    @NotNull(message = "La date de réservation est obligatoire")
    @Future(message = "La date de réservation doit être dans le futur")
    private LocalDateTime reservationDate;


    // ============================================
    // Constructeurs
    // ============================================

    public ReservationRequestDTO() {
    }

    public ReservationRequestDTO(String clientName, String email, String phone,
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

    public Boolean getIsPartner() {
        return isPartner;
    }

    public void setIsPartner(Boolean isPartner) {
        this.isPartner = isPartner;
    }

    public LocalDateTime getReservationDate() {
        return reservationDate;
    }

    public void setReservationDate(LocalDateTime reservationDate) {
        this.reservationDate = reservationDate;
    }


    @Override
    public String toString() {
        return "ReservationRequestDTO{" +
                "clientName='" + clientName + '\'' +
                ", email='" + email + '\'' +
                ", establishmentName='" + establishmentName + '\'' +
                ", establishmentType='" + establishmentType + '\'' +
                ", imageUrl='" + imageUrl + '\'' +
                ", numberOfPeople=" + numberOfPeople +
                ", isPartner=" + isPartner +

                '}';
    }
}