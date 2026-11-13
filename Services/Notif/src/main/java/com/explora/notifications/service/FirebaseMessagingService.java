package com.explora.notifications.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FirebaseMessagingService {

    /**
     * Envoie une notification push à UN téléphone précis via son token FCM
     *
     * @param token   Le token FCM du téléphone destinataire
     * @param title   Le titre de la notification
     * @param body    Le message de la notification
     * @return L'ID du message envoyé (ou null si échec)
     */
    public String sendNotification(String token, String title, String body) {
        // Construire la notification
        Notification notification = Notification.builder()
                .setTitle(title)
                .setBody(body)
                .build();

        // Construire le message à envoyer
        Message message = Message.builder()
                .setToken(token)
                .setNotification(notification)
                .build();

        try {
            // Envoyer via Firebase
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("✅ Notification envoyée : " + response);
            return response;
        } catch (FirebaseMessagingException e) {
            System.err.println("❌ Erreur d'envoi : " + e.getMessage());
            return null;
        }
    }
}