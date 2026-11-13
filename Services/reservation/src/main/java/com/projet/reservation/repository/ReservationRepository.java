package com.projet.reservation.repository;

import com.projet.reservation.model.Reservation;
import com.projet.reservation.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Trouver toutes les réservations d'un client par email
     */
    List<Reservation> findByEmail(String email);

    /**
     * Trouver toutes les réservations pour un établissement
     */
    List<Reservation> findByEstablishmentName(String establishmentName);

    /**
     * Trouver toutes les réservations par statut
     */
    List<Reservation> findByStatus(ReservationStatus status);

    /**
     * NOUVELLE MÉTHODE : Trouver les réservations en attente créées avant une certaine date
     * Utilisée par le scheduler pour confirmer automatiquement les réservations après 10 minutes
     */
    List<Reservation> findByStatusAndCreatedAtBefore(
            ReservationStatus status,
            LocalDateTime createdAt
    );

    /**
     * Trouver les réservations confirmées pour une date donnée
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = 'CONFIRMED' " +
            "AND DATE(r.reservationDate) = DATE(:date)")
    List<Reservation> findConfirmedReservationsForDate(LocalDateTime date);

    /**
     * Compter les réservations par statut
     */
    long countByStatus(ReservationStatus status);

    /**
     * Trouver les réservations à venir (confirmées et date future)
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = 'CONFIRMED' " +
            "AND r.reservationDate > CURRENT_TIMESTAMP " +
            "ORDER BY r.reservationDate ASC")
    List<Reservation> findUpcomingReservations();

    /**
     * Trouver les réservations passées qui devraient être marquées comme complétées
     */
    @Query("SELECT r FROM Reservation r WHERE r.status = 'CONFIRMED' " +
            "AND r.reservationDate < CURRENT_TIMESTAMP")
    List<Reservation> findPastConfirmedReservations();

    // ════════════════════════════════════════════════════════════════
    // METHODES PAR USER ID (pour le filtrage par propriétaire)
    // ════════════════════════════════════════════════════════════════

    /**
     * Trouver toutes les réservations d'un utilisateur par son ID
     */
    List<Reservation> findByUserId(Long userId);

    /**
     * Trouver les réservations d'un utilisateur par statut
     */
    List<Reservation> findByUserIdAndStatus(Long userId, ReservationStatus status);

    /**
     * Trouver les réservations à venir d'un utilisateur
     */
    @Query("SELECT r FROM Reservation r WHERE r.userId = :userId " +
            "AND r.status = 'CONFIRMED' AND r.reservationDate > CURRENT_TIMESTAMP " +
            "ORDER BY r.reservationDate ASC")
    List<Reservation> findUpcomingReservationsByUserId(Long userId);
}