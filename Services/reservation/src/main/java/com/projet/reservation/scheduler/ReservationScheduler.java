package com.projet.reservation.scheduler;

import com.projet.reservation.model.Reservation;
import com.projet.reservation.model.ReservationStatus;
import com.projet.reservation.repository.ReservationRepository;
import com.projet.reservation.service.ReservationService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@EnableScheduling
public class ReservationScheduler {

    private static final Logger logger = LoggerFactory.getLogger(ReservationScheduler.class);

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ReservationService reservationService;

    /**
     * Confirme automatiquement les réservations en attente après 10 minutes
     * S'exécute toutes les 2 minutes
     */
    @Scheduled(fixedRate = 120000) 
    public void autoConfirmPendingReservations() {
        logger.debug("🔄 Vérification des réservations à confirmer...");

        // On peut baisser à 1 minute pour le test utilisateur si besoin
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(1);

        List<Reservation> pendingReservations = reservationRepository
                .findByStatusAndCreatedAtBefore(ReservationStatus.PENDING, threshold);

        if (pendingReservations.isEmpty()) return;

        logger.info("📋 {} réservation(s) à confirmer automatiquement", pendingReservations.size());

        for (Reservation reservation : pendingReservations) {
            try {
                // Utiliser le service pour confirmer (ce qui déclenche la notification)
                reservationService.confirmReservation(reservation.getId());
                
                logger.info("✅ Réservation #{} confirmée et notifiée", reservation.getId());
            } catch (Exception e) {
                logger.error("❌ Erreur auto-confirm #{}: {}", reservation.getId(), e.getMessage());
            }
        }
    }

    @Scheduled(fixedRate = 3600000) 
    public void markPastReservationsAsCompleted() {
        List<Reservation> pastReservations = reservationRepository.findPastConfirmedReservations();
        for (Reservation reservation : pastReservations) {
            reservation.setStatus(ReservationStatus.COMPLETED);
            reservationRepository.save(reservation);
        }
    }

    @Scheduled(cron = "0 0 23 * * *")
    public void dailyStatistics() {
        logger.info("📊 Stats quotidiennes générées");
    }
}
