package com.projet.reservation.model;

/**
 * Enum représentant les différents statuts d'une réservation
 */
public enum ReservationStatus {
    /**
     * Réservation en attente de confirmation (état initial)
     */
    PENDING,

    /**
     * Réservation confirmée (après 10 minutes ou confirmation manuelle)
     */
    CONFIRMED,

    /**
     * Réservation annulée par le client ou l'admin
     */
    CANCELLED,

    /**
     * Réservation terminée (après la date de réservation)
     */
    COMPLETED
}