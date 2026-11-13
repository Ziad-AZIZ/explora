package com.explora.notifications.service;

import com.explora.notifications.dto.ScheduleMatchReminderRequest;
import com.explora.notifications.entity.ScheduledNotification;
import com.explora.notifications.enums.NotificationType;
import com.explora.notifications.repository.ScheduledNotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SchedulingService {

    @Autowired
    private ScheduledNotificationRepository scheduledRepo;

    @Autowired
    private FirebaseMessagingService firebaseMessagingService;

    @Autowired
    private com.explora.notifications.repository.DeviceTokenRepository deviceTokenRepository;

    /**
     * Planifie 3 rappels pour un match (J-1, H-2, H-15min)
     */
    public List<ScheduledNotification> scheduleMatchReminders(ScheduleMatchReminderRequest request) {
        List<ScheduledNotification> created = new java.util.ArrayList<>();

        // 1. Rappel J-1 (la veille à la même heure)
        created.add(createReminder(
                request.getUserId(),
                "🏟️ Match demain !",
                "N'oublie pas ! " + request.getMatchName() + " demain à "
                        + request.getMatchDate().getHour() + "h au " + request.getStadium(),
                request.getMatchDate().minusDays(1)
        ));

        // 2. Rappel H-2 (2 heures avant)
        created.add(createReminder(
                request.getUserId(),
                "🚗 Il faut partir !",
                "Ton match commence dans 2h. Il faut partir maintenant pour arriver à temps.",
                request.getMatchDate().minusHours(2)
        ));

        // 3. Rappel H-15min (15 minutes avant)
        created.add(createReminder(
                request.getUserId(),
                "⚽ Ça commence !",
                "Ça commence ! Profite bien du match : " + request.getMatchName(),
                request.getMatchDate().minusMinutes(15)
        ));

        return created;
    }

    private ScheduledNotification createReminder(Long userId, String title, String body, LocalDateTime when) {
        ScheduledNotification notif = new ScheduledNotification();
        notif.setUserId(userId);
        notif.setTitle(title);
        notif.setBody(body);
        notif.setType(NotificationType.MATCH_REMINDER);
        notif.setScheduledFor(when);
        notif.setSent(false);
        return scheduledRepo.save(notif);
    }

    /**
     * SCHEDULER : tourne toutes les 60 secondes.
     * Récupère les notifs en attente dont l'heure est passée et les envoie.
     */
    @Scheduled(fixedRate = 60000) // 60 000 ms = 1 minute
    public void processScheduledNotifications() {
        LocalDateTime now = LocalDateTime.now();
        List<ScheduledNotification> due = scheduledRepo.findBySentFalseAndScheduledForBefore(now);

        if (due.isEmpty()) {
            return; // Rien à faire, on évite de polluer les logs
        }

        System.out.println("📅 Scheduler : " + due.size() + " notification(s) à envoyer");

        for (ScheduledNotification notif : due) {
            try {
                // Récupérer les tokens du user
                var tokens = deviceTokenRepository.findByUserId(notif.getUserId());

                if (tokens.isEmpty()) {
                    System.out.println("⚠️ Pas de token pour userId=" + notif.getUserId());
                } else {
                    // Envoyer à chaque device
                    for (var token : tokens) {
                        firebaseMessagingService.sendNotification(
                                token.getToken(),
                                notif.getTitle(),
                                notif.getBody()
                        );
                    }
                }

                // Marquer comme envoyée
                notif.setSent(true);
                notif.setSentAt(LocalDateTime.now());
                scheduledRepo.save(notif);

                System.out.println("✅ Notification " + notif.getId() + " envoyée");

            } catch (Exception e) {
                System.err.println("❌ Erreur envoi notif " + notif.getId() + " : " + e.getMessage());
            }
        }
    }
}