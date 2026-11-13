package com.explora.notifications.service;

import com.explora.notifications.dto.RegisterTokenRequest;
import com.explora.notifications.entity.DeviceToken;
import com.explora.notifications.entity.Notification;
import com.explora.notifications.repository.DeviceTokenRepository;
import com.explora.notifications.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.explora.notifications.dto.SendNotificationRequest;

import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {

    @Autowired
    private FirebaseMessagingService firebaseMessagingService;

    @Autowired
    private DeviceTokenRepository deviceTokenRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    // 1. Enregistrer ou mettre à jour un token
    public DeviceToken registerToken(RegisterTokenRequest request) {
        // Vérifier si ce token existe déjà
        Optional<DeviceToken> existing = deviceTokenRepository.findByToken(request.getToken());

        DeviceToken deviceToken;
        if (existing.isPresent()) {
            // Mise à jour de l'existant
            deviceToken = existing.get();
        } else {
            // Création d'un nouveau
            deviceToken = new DeviceToken();
        }

        deviceToken.setUserId(request.getUserId());
        deviceToken.setToken(request.getToken());
        deviceToken.setPlatform(request.getPlatform());
        deviceToken.setLanguage(request.getLanguage());

        return deviceTokenRepository.save(deviceToken);
    }

    // 2. Récupérer toutes les notifications d'un user
    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 3. Récupérer uniquement les non-lues
    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndReadFalse(userId);
    }

    // 4. Marquer une notification comme lue (avec verif proprietaire)
    public boolean markAsRead(Long notificationId, Long userId) {
        Optional<Notification> optionalNotif = notificationRepository.findById(notificationId);
        if (optionalNotif.isPresent()) {
            Notification notif = optionalNotif.get();
            if (!notif.getUserId().equals(userId)) {
                throw new RuntimeException("Accès interdit");
            }
            notif.setRead(true);
            notificationRepository.save(notif);
            return true;
        }
        return false;
    }

    // 4.1 Supprimer une notification
    public boolean deleteNotification(Long notificationId, Long userId) {
        Optional<Notification> optionalNotif = notificationRepository.findById(notificationId);
        if (optionalNotif.isPresent()) {
            Notification notif = optionalNotif.get();
            if (!notif.getUserId().equals(userId)) {
                throw new RuntimeException("Accès interdit");
            }
            notificationRepository.delete(notif);
            return true;
        }
        return false;
    }

    // 4.2 Supprimer toutes les notifications
    public void deleteAllUserNotifications(Long userId) {
        List<Notification> notifs = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notificationRepository.deleteAll(notifs);
    }

    // 5. Envoyer une notification à un utilisateur (push + sauvegarde)
    public boolean sendNotificationToUser(SendNotificationRequest request) {
        // 1. Sauvegarder d'abord dans l'historique (toujours visible dans la cloche in-app)
        Notification notif = new Notification();
        notif.setUserId(request.getUserId());
        notif.setTitle(request.getTitle());
        notif.setMessage(request.getBody());
        notif.setType(request.getType());
        notif.setRead(false);
        notificationRepository.save(notif);
        System.out.println("💾 Notification sauvegardée en base pour userId=" + request.getUserId());

        // 2. Tenter l'envoi Push via Firebase
        List<DeviceToken> tokens = deviceTokenRepository.findByUserId(request.getUserId());
        if (tokens.isEmpty()) {
            System.out.println("ℹ️ Pas de token Push pour userId=" + request.getUserId() + " (Uniquement in-app)");
            return true; // On retourne true car la notification in-app est créée
        }

        boolean atLeastOneSuccess = false;
        for (DeviceToken deviceToken : tokens) {
            String result = firebaseMessagingService.sendNotification(
                    deviceToken.getToken(),
                    request.getTitle(),
                    request.getBody()
            );
            if (result != null) atLeastOneSuccess = true;
        }

        return atLeastOneSuccess;
    }
}