package com.maroc2030.controller;

import com.maroc2030.model.Notification;
import com.maroc2030.model.UserNotification;
import com.maroc2030.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // ============================================
    // ADMIN ENDPOINTS
    // ============================================

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable Long id) {
        return notificationService.getNotificationById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification created = notificationService.createNotification(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/send-all")
    public ResponseEntity<Notification> sendNotificationToAll(@RequestBody Notification notification) {
        Notification sent = notificationService.sendNotificationToAll(notification);
        return ResponseEntity.status(HttpStatus.CREATED).body(sent);
    }

    @PostMapping("/send-user")
    public ResponseEntity<Void> sendNotificationToUser(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long notificationId = request.get("notificationId");
        notificationService.sendNotificationToUser(userId, notificationId);
        return ResponseEntity.ok().build();
    }

    // ============================================
    // USER ENDPOINTS
    // ============================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getUserNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<Map<String, Object>>> getUnreadNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@PathVariable Long userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/user/{userId}/mark-read/{userNotificationId}")
    public ResponseEntity<UserNotification> markAsRead(
            @PathVariable Long userId,
            @PathVariable Long userNotificationId) {
        try {
            UserNotification updated = notificationService.markAsRead(userId, userNotificationId);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/user/{userId}/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserNotification(@PathVariable Long id) {
        notificationService.deleteUserNotification(id);
        return ResponseEntity.noContent().build();
    }
}