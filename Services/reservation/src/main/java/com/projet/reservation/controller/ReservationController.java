package com.projet.reservation.controller;

import com.projet.reservation.dto.ReservationRequestDTO;
import com.projet.reservation.dto.ReservationResponseDTO;
import com.projet.reservation.model.Reservation;
import com.projet.reservation.model.ReservationStatus;
import com.projet.reservation.security.JwtService;
import com.projet.reservation.service.ReservationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Contrôleur REST pour gérer les réservations
 * =============================================
 * Toutes les opérations (sauf /health) nécessitent un JWT valide.
 * L'userId est extrait du JWT — jamais du body ni de l'URL.
 * Ownership enforcement : un utilisateur ne peut accéder qu'à ses propres réservations.
 */
@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    private static final Logger logger = LoggerFactory.getLogger(ReservationController.class);

    @Autowired
    private ReservationService service;

    @Autowired
    private JwtService jwtService;

    // ════════════════════════════════════════════════════════════════
    // HELPER : extraire le userId depuis le JWT
    // ════════════════════════════════════════════════════════════════

    private Long extractUserIdFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        String token = header.substring(7); // enlever "Bearer "
        return jwtService.extractUserId(token);
    }

    // ════════════════════════════════════════════════════════════════
    // PUBLIC
    // ════════════════════════════════════════════════════════════════

    /**
     * Health check (public — pas de JWT requis)
     * GET /api/reservations/health
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of(
                "status", "ok",
                "service", "reservation",
                "version", "3.0-jwt",
                "timestamp", java.time.LocalDateTime.now().toString()
        ));
    }

    // ════════════════════════════════════════════════════════════════
    // CRÉATION (JWT requis — userId extrait du token)
    // ════════════════════════════════════════════════════════════════

    /**
     * Créer une réservation (ancien format — objet Reservation brut)
     * POST /api/reservations
     */
    @PostMapping
    public ResponseEntity<ReservationResponseDTO> create(
            @RequestBody Reservation reservation,
            HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("📝 Création de réservation (userId={})", userId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReservationResponseDTO.fromEntity(service.save(reservation, userId)));
    }

    /**
     * Créer une réservation avec validation (DTO)
     * POST /api/reservations/new
     */
    @PostMapping("/new")
    public ResponseEntity<ReservationResponseDTO> createWithDTO(
            @Valid @RequestBody ReservationRequestDTO dto,
            HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("📝 Création de réservation pour {} (userId={})", dto.getClientName(), userId);
        Reservation reservation = service.createReservation(dto, userId);
        logger.info("✅ Réservation #{} créée avec succès", reservation.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ReservationResponseDTO.fromEntity(reservation));
    }

    // ════════════════════════════════════════════════════════════════
    // LECTURE (filtrée par userId — ownership enforcement)
    // ════════════════════════════════════════════════════════════════

    /**
     * Liste les réservations de l'utilisateur authentifié
     * GET /api/reservations
     */
    @GetMapping
    public ResponseEntity<List<ReservationResponseDTO>> getMyReservations(HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("📋 Récupération des réservations pour userId={}", userId);
        List<ReservationResponseDTO> list = service.getReservationsByUserId(userId)
                .stream()
                .map(ReservationResponseDTO::fromEntity)
                .toList();
        return ResponseEntity.ok(list);
    }

    /**
     * Détails d'une réservation (ownership check)
     * GET /api/reservations/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("🔍 Recherche réservation #{} (userId={})", id, userId);

        Reservation reservation = service.getReservationById(id);
        if (!reservation.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Vous ne pouvez pas accéder à cette réservation"));
        }
        return ResponseEntity.ok(ReservationResponseDTO.fromEntity(reservation));
    }

    /**
     * Réservations de l'utilisateur filtrées par statut
     * GET /api/reservations/status/{status}
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<?> getByStatus(@PathVariable String status, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("🔍 Filtrage par statut: {} (userId={})", status, userId);
        try {
            ReservationStatus reservationStatus = ReservationStatus.valueOf(status.toUpperCase());
            List<ReservationResponseDTO> list = service.getReservationsByUserIdAndStatus(userId, reservationStatus)
                    .stream()
                    .map(ReservationResponseDTO::fromEntity)
                    .toList();
            logger.info("✅ {} réservation(s) avec statut {}", list.size(), status);
            return ResponseEntity.ok(list);
        } catch (IllegalArgumentException e) {
            logger.error("❌ Statut invalide: {}", status);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Réservations à venir de l'utilisateur
     * GET /api/reservations/upcoming
     */
    @GetMapping("/upcoming")
    public ResponseEntity<List<ReservationResponseDTO>> getUpcoming(HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("📅 Récupération réservations à venir (userId={})", userId);
        List<ReservationResponseDTO> list = service.getUpcomingReservationsByUserId(userId)
                .stream()
                .map(ReservationResponseDTO::fromEntity)
                .toList();
        logger.info("✅ {} réservation(s) à venir", list.size());
        return ResponseEntity.ok(list);
    }

    // ════════════════════════════════════════════════════════════════
    // GESTION DU STATUT (ownership check)
    // ════════════════════════════════════════════════════════════════

    /**
     * Confirmer une réservation (ownership check)
     * POST /api/reservations/{id}/confirm
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmReservation(@PathVariable Long id, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("✅ Confirmation réservation #{} (userId={})", id, userId);

        Reservation reservation = service.getReservationById(id);
        if (!reservation.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Vous ne pouvez pas confirmer cette réservation"));
        }

        Reservation confirmed = service.confirmReservation(id);
        return ResponseEntity.ok(ReservationResponseDTO.fromEntity(confirmed));
    }

    /**
     * Annuler une réservation avec POST (ownership check)
     * POST /api/reservations/{id}/cancel
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<?> cancelReservationPost(@PathVariable Long id, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("❌ Annulation réservation #{} (userId={})", id, userId);

        Reservation reservation = service.getReservationById(id);
        if (!reservation.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Vous ne pouvez pas annuler cette réservation"));
        }

        Reservation cancelled = service.cancelReservation(id);
        return ResponseEntity.ok(ReservationResponseDTO.fromEntity(cancelled));
    }

    /**
     * Annuler avec DELETE (ownership check)
     * DELETE /api/reservations/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancel(@PathVariable Long id, HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        logger.info("❌ Annulation réservation #{} via DELETE (userId={})", id, userId);

        Reservation reservation = service.getReservationById(id);
        if (!reservation.getUserId().equals(userId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Vous ne pouvez pas annuler cette réservation"));
        }

        service.cancelReservation(id);
        return ResponseEntity.ok(Map.of("message", "Réservation annulée"));
    }

    // ════════════════════════════════════════════════════════════════
    // STATISTIQUES (globales — pas de filtrage par user)
    // ════════════════════════════════════════════════════════════════

    /**
     * Statistiques globales
     * GET /api/reservations/statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ReservationService.ReservationStatistics> getStatistics() {
        logger.info("📊 Récupération des statistiques");
        ReservationService.ReservationStatistics stats = service.getStatistics();
        logger.info("✅ Stats: Total={}, Pending={}, Confirmed={}",
                stats.getTotal(), stats.getPending(), stats.getConfirmed());
        return ResponseEntity.ok(stats);
    }
}