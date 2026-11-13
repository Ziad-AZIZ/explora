package com.maroc2030.service;

import com.maroc2030.model.Notification;
import com.maroc2030.model.NotificationType;
import com.maroc2030.model.UserNotification;
import com.maroc2030.repository.NotificationRepository;
import com.maroc2030.repository.UserNotificationRepository;
import com.maroc2030.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserNotificationRepository userNotificationRepository;

    @Autowired
    private UserRepository userRepository;

    // ============================================
    // NOTIFICATIONS (Admin)
    // ============================================

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public Optional<Notification> getNotificationById(Long id) {
        return notificationRepository.findById(id);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Transactional
    public Notification sendNotificationToAll(Notification notification) {
        Notification saved = notificationRepository.save(notification);

        // Envoyer à tous les utilisateurs qui ont les notifications activées
        List<Long> userIds = userRepository.findAll().stream()
                .filter(user -> user.getNotificationsEnabled())
                .map(user -> user.getId())
                .toList();

        for (Long userId : userIds) {
            UserNotification userNotif = new UserNotification();
            userNotif.setUserId(userId);
            userNotif.setNotificationId(saved.getId());
            userNotificationRepository.save(userNotif);
        }

        return saved;
    }

    @Transactional
    public void sendNotificationToUser(Long userId, Long notificationId) {
        UserNotification userNotif = new UserNotification();
        userNotif.setUserId(userId);
        userNotif.setNotificationId(notificationId);
        userNotificationRepository.save(userNotif);
    }

    // ============================================
    // USER NOTIFICATIONS
    // ============================================

    public List<Map<String, Object>> getUserNotifications(Long userId) {
        List<UserNotification> userNotifs = userNotificationRepository
                .findByUserIdOrderByReceivedAtDesc(userId);

        List<Map<String, Object>> result = new ArrayList<>();

        for (UserNotification userNotif : userNotifs) {
            Optional<Notification> notif = notificationRepository
                    .findById(userNotif.getNotificationId());

            if (notif.isPresent()) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", userNotif.getId());
                item.put("notificationId", notif.get().getId());
                item.put("title", notif.get().getTitle());
                item.put("message", notif.get().getMessage());
                item.put("type", notif.get().getType());
                item.put("imageUrl", notif.get().getImageUrl());
                item.put("actionUrl", notif.get().getActionUrl());
                item.put("isRead", userNotif.getIsRead());
                item.put("receivedAt", userNotif.getReceivedAt());
                item.put("readAt", userNotif.getReadAt());

                result.add(item);
            }
        }

        return result;
    }

    public List<Map<String, Object>> getUnreadNotifications(Long userId) {
        List<UserNotification> userNotifs = userNotificationRepository
                .findByUserIdAndIsRead(userId, false);

        List<Map<String, Object>> result = new ArrayList<>();

        for (UserNotification userNotif : userNotifs) {
            Optional<Notification> notif = notificationRepository
                    .findById(userNotif.getNotificationId());

            if (notif.isPresent()) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", userNotif.getId());
                item.put("title", notif.get().getTitle());
                item.put("message", notif.get().getMessage());
                item.put("type", notif.get().getType());
                item.put("receivedAt", userNotif.getReceivedAt());

                result.add(item);
            }
        }

        return result;
    }

    public Long getUnreadCount(Long userId) {
        return userNotificationRepository.countByUserIdAndIsRead(userId, false);
    }

    @Transactional
    public UserNotification markAsRead(Long userId, Long userNotificationId) {
        UserNotification userNotif = userNotificationRepository.findById(userNotificationId)
                .orElseThrow(() -> new RuntimeException("UserNotification not found"));

        if (!userNotif.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        userNotif.setIsRead(true);
        userNotif.setReadAt(LocalDateTime.now());

        return userNotificationRepository.save(userNotif);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<UserNotification> unreadNotifs = userNotificationRepository
                .findByUserIdAndIsRead(userId, false);

        for (UserNotification notif : unreadNotifs) {
            notif.setIsRead(true);
            notif.setReadAt(LocalDateTime.now());
            userNotificationRepository.save(notif);
        }
    }

    public void deleteUserNotification(Long id) {
        userNotificationRepository.deleteById(id);
    }
}