package com.projet.reservation.service;

import com.projet.reservation.dto.ReservationRequestDTO;
import com.projet.reservation.exception.ResourceNotFoundException;
import com.projet.reservation.model.Reservation;
import com.projet.reservation.model.ReservationStatus;
import com.projet.reservation.repository.ReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
@Transactional
public class ReservationService {

    private static final Logger logger = LoggerFactory.getLogger(ReservationService.class);

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private com.projet.reservation.client.NotifClient notifClient;

    /**
     * Méthode centralisée pour envoyer une notification
     */
    public void triggerNotification(Reservation reservation) {
        if (reservation.getUserId() == null) {
            logger.warn("⚠️ Impossible d'envoyer la notification : userId manquant pour la réservation #{}", reservation.getId());
            return;
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("userId", reservation.getUserId());
            payload.put("email", reservation.getEmail());
            payload.put("phone", reservation.getPhone());
            payload.put("establishmentName", reservation.getEstablishmentName());
            payload.put("status", reservation.getStatus().toString());

            logger.info("🔔 Envoi notification au microservice Notif (userId={}, status={})", 
                    reservation.getUserId(), reservation.getStatus());
            notifClient.sendConfirmation(payload);
            logger.info("✅ Signal envoyé avec succès");
        } catch (Exception e) {
            logger.warn("⚠️ Échec Notif (Service Notif peut-être éteint) : {}", e.getMessage());
        }
    }

    public Reservation save(Reservation reservation, Long userId) {
        logger.info("📝 Sauvegarde directe d'une réservation pour {} (userId={})",
                reservation.getClientName(), userId);

        reservation.setUserId(userId);
        if (reservation.getStatus() == null) {
            reservation.setStatus(ReservationStatus.PENDING);
        }

        Reservation saved = reservationRepository.save(reservation);
        
        // Si c'est déjà confirmé (ex: via frontend direct), on notifie
        if (saved.getStatus() == ReservationStatus.CONFIRMED) {
            triggerNotification(saved);
        }
        
        return saved;
    }

    public Reservation createReservation(ReservationRequestDTO dto, Long userId) {
        logger.info("📝 Création via DTO pour {} (userId={})", dto.getClientName(), userId);

        Reservation reservation = new Reservation();
        reservation.setClientName(dto.getClientName());
        reservation.setEmail(dto.getEmail());
        reservation.setPhone(dto.getPhone());
        reservation.setEstablishmentName(dto.getEstablishmentName());
        reservation.setEstablishmentType(dto.getEstablishmentType());
        reservation.setImageUrl(dto.getImageUrl());
        reservation.setNumberOfPeople(dto.getNumberOfPeople());
        reservation.setReservationDate(dto.getReservationDate());
        reservation.setUserId(userId);

        if (Boolean.TRUE.equals(dto.getIsPartner())) {
            reservation.setStatus(ReservationStatus.CONFIRMED);
            reservation.setConfirmedAt(LocalDateTime.now());
        } else {
            reservation.setStatus(ReservationStatus.PENDING);
        }

        Reservation saved = reservationRepository.save(reservation);

        // Envoyer la notification
        triggerNotification(saved);

        return saved;
    }

    public Reservation confirmReservation(Long id) {
        logger.info("✅ Confirmation de la réservation #{}", id);
        Reservation reservation = getReservationById(id);
        
        if (reservation.getStatus() == ReservationStatus.PENDING) {
            reservation.setStatus(ReservationStatus.CONFIRMED);
            reservation.setConfirmedAt(LocalDateTime.now());
            Reservation confirmed = reservationRepository.save(reservation);
            
            // Notification lors de la confirmation
            triggerNotification(confirmed);
            return confirmed;
        }
        return reservation;
    }

    // --- LECTURE ---

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Reservation getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Réservation #" + id + " non trouvée"));
    }

    public List<Reservation> getReservationsByUserId(Long userId) {
        return reservationRepository.findByUserId(userId);
    }

    public List<Reservation> getReservationsByEmail(String email) {
        return reservationRepository.findByEmail(email);
    }

    public List<Reservation> getReservationsByStatus(ReservationStatus status) {
        return reservationRepository.findByStatus(status);
    }

    public List<Reservation> getReservationsByUserIdAndStatus(Long userId, ReservationStatus status) {
        return reservationRepository.findByUserIdAndStatus(userId, status);
    }

    public List<Reservation> getUpcomingReservations() {
        return reservationRepository.findUpcomingReservations();
    }

    public List<Reservation> getUpcomingReservationsByUserId(Long userId) {
        return reservationRepository.findUpcomingReservationsByUserId(userId);
    }

    // --- AUTRES ACTIONS ---

    public Reservation cancelReservation(Long id) {
        Reservation reservation = getReservationById(id);
        reservation.setStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(reservation);
    }

    public void deleteReservation(Long id) {
        if (!reservationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Réservation #" + id + " non trouvée");
        }
        reservationRepository.deleteById(id);
    }

    public ReservationStatistics getStatistics() {
        long total = reservationRepository.count();
        long pending = reservationRepository.countByStatus(ReservationStatus.PENDING);
        long confirmed = reservationRepository.countByStatus(ReservationStatus.CONFIRMED);
        long completed = reservationRepository.countByStatus(ReservationStatus.COMPLETED);
        long cancelled = reservationRepository.countByStatus(ReservationStatus.CANCELLED);
        return new ReservationStatistics(total, pending, confirmed, completed, cancelled);
    }

    public static class ReservationStatistics {
        private final long total;
        private final long pending;
        private final long confirmed;
        private final long completed;
        private final long cancelled;

        public ReservationStatistics(long total, long pending, long confirmed, long completed, long cancelled) {
            this.total = total;
            this.pending = pending;
            this.confirmed = confirmed;
            this.completed = completed;
            this.cancelled = cancelled;
        }

        public long getTotal() { return total; }
        public long getPending() { return pending; }
        public long getConfirmed() { return confirmed; }
        public long getCompleted() { return completed; }
        public long getCancelled() { return cancelled; }
    }
}