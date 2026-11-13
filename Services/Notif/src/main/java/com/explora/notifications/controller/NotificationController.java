package com.explora.notifications.controller;

import com.explora.notifications.dto.ApiResponse;
import com.explora.notifications.dto.RegisterTokenRequest;
import com.explora.notifications.entity.DeviceToken;
import com.explora.notifications.entity.Notification;
import com.explora.notifications.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.explora.notifications.dto.SendNotificationRequest;
import com.explora.notifications.dto.SendTemplatedNotificationRequest;
import com.explora.notifications.service.TemplateService;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Date;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private TemplateService templateService;

    @Autowired
    private NotificationService notificationService;

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleException(Exception e) {
        System.err.println("❌ Erreur Controller Notif : " + e.getMessage());
        e.printStackTrace();
        return ResponseEntity.status(500).body(new ApiResponse(false, "Erreur Serveur : " + e.getMessage()));
    }

    private Long getAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("Utilisateur non authentifié (Authentication null)");
        }
        
        Object principal = auth.getPrincipal();
        if (principal instanceof Long) return (Long) principal;
        if (principal instanceof Integer) return ((Integer) principal).longValue();
        if (principal instanceof String) {
            try {
                return Long.parseLong((String) principal);
            } catch (NumberFormatException e) {
                throw new RuntimeException("ID principal invalide : " + principal);
            }
        }
        throw new RuntimeException("Format d'ID utilisateur inconnu : " + principal.getClass().getName());
    }

    @PostMapping("/register-token")
    public ResponseEntity<ApiResponse> registerToken(@RequestBody RegisterTokenRequest request) {
        request.setUserId(getAuthenticatedUserId());
        DeviceToken saved = notificationService.registerToken(request);
        return ResponseEntity.ok(new ApiResponse(true, "Token enregistré (id=" + saved.getId() + ")"));
    }

    // --- ROUTES POUR L'UTILISATEUR CONNECTÉ (ME) ---

    @GetMapping("/user/me")
    public ResponseEntity<List<Notification>> getMyNotifications() {
        return ResponseEntity.ok(notificationService.getUserNotifications(getAuthenticatedUserId()));
    }

    @GetMapping("/user/me/unread")
    public ResponseEntity<List<Notification>> getMyUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(getAuthenticatedUserId()));
    }

    @DeleteMapping("/user/me/all")
    public ResponseEntity<ApiResponse> deleteMyAllNotifications() {
        notificationService.deleteAllUserNotifications(getAuthenticatedUserId());
        return ResponseEntity.ok(new ApiResponse(true, "Toutes vos notifications ont été supprimées"));
    }

    // --- ROUTES PAR ID (COMPATIBILITÉ / ADMIN) ---

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Notification>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @DeleteMapping("/user/{userId}/all")
    public ResponseEntity<ApiResponse> deleteAllNotifications(@PathVariable Long userId) {
        notificationService.deleteAllUserNotifications(userId);
        return ResponseEntity.ok(new ApiResponse(true, "Notifications supprimées pour l'utilisateur " + userId));
    }

    // --- ACTIONS INDIVIDUELLES ---

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse> markAsRead(@PathVariable Long id) {
        boolean success = notificationService.markAsRead(id, getAuthenticatedUserId());
        if (success) return ResponseEntity.ok(new ApiResponse(true, "Marquée comme lue"));
        return ResponseEntity.status(404).body(new ApiResponse(false, "Notification introuvable"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteNotification(@PathVariable Long id) {
        boolean success = notificationService.deleteNotification(id, getAuthenticatedUserId());
        if (success) return ResponseEntity.ok(new ApiResponse(true, "Supprimée"));
        return ResponseEntity.status(404).body(new ApiResponse(false, "Notification introuvable"));
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse> health() {
        return ResponseEntity.ok(new ApiResponse(true, "Service Notifications opérationnel 🚀"));
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse> sendNotification(@RequestBody SendNotificationRequest request) {
        boolean success = notificationService.sendNotificationToUser(request);
        if (success) return ResponseEntity.ok(new ApiResponse(true, "Notification envoyée"));
        return ResponseEntity.badRequest().body(new ApiResponse(false, "Échec de l'envoi"));
    }

    @PostMapping("/send-templated")
    public ResponseEntity<ApiResponse> sendTemplated(@RequestBody SendTemplatedNotificationRequest request) {
        String[] message = templateService.buildMessage(request.getType(), request.getLanguage(), request.getVariables());
        if (message == null) return ResponseEntity.badRequest().body(new ApiResponse(false, "Template introuvable"));

        com.explora.notifications.dto.SendNotificationRequest sendReq = new com.explora.notifications.dto.SendNotificationRequest();
        sendReq.setUserId(request.getUserId());
        sendReq.setTitle(message[0]);
        sendReq.setBody(message[1]);
        sendReq.setType(request.getType());

        notificationService.sendNotificationToUser(sendReq);
        return ResponseEntity.ok(new ApiResponse(true, "Généré : " + message[0]));
    }

    @PostMapping("/send-confirmation")
    public ResponseEntity<ApiResponse> sendConfirmation(@RequestBody Map<String, Object> payload) {
        try {
            Long userId = null;
            if (payload.containsKey("userId")) userId = Long.valueOf(payload.get("userId").toString());
            if (userId == null) return ResponseEntity.badRequest().body(new ApiResponse(false, "userId manquant"));

            Map<String, String> vars = new HashMap<>();
            vars.put("hotelName", payload.getOrDefault("establishmentName", "l'établissement").toString());
            vars.put("date", new Date().toString());

            String[] message = templateService.buildMessage(com.explora.notifications.enums.NotificationType.BOOKING_CONFIRMATION, "fr", vars);
            if (message != null) {
                com.explora.notifications.dto.SendNotificationRequest sendReq = new com.explora.notifications.dto.SendNotificationRequest();
                sendReq.setUserId(userId);
                sendReq.setTitle(message[0]);
                sendReq.setBody(message[1]);
                sendReq.setType(com.explora.notifications.enums.NotificationType.BOOKING_CONFIRMATION);
                notificationService.sendNotificationToUser(sendReq);
                return ResponseEntity.ok(new ApiResponse(true, "Notification traitée"));
            }
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Template introuvable"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse(false, "Erreur : " + e.getMessage()));
        }
    }
}