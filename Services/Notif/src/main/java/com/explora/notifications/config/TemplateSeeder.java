package com.explora.notifications.config;

import com.explora.notifications.entity.NotificationTemplate;
import com.explora.notifications.enums.NotificationType;
import com.explora.notifications.repository.NotificationTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TemplateSeeder implements CommandLineRunner {

    @Autowired
    private NotificationTemplateRepository templateRepo;

    @Override
    public void run(String... args) {
        if (templateRepo.count() > 0) {
            System.out.println("ℹ️ Templates déjà présents, skip seeding");
            return;
        }

        System.out.println("🌱 Insertion des templates de notifications...");

        // ===== MATCH REMINDER =====
        save(NotificationType.MATCH_REMINDER, "fr",
                "🏟️ {{matchName}} demain !",
                "N'oublie pas ! {{matchName}} demain à {{time}} au {{stadium}}.");
        save(NotificationType.MATCH_REMINDER, "en",
                "🏟️ {{matchName}} tomorrow!",
                "Don't forget! {{matchName}} tomorrow at {{time}} at {{stadium}}.");
        save(NotificationType.MATCH_REMINDER, "ar",
                "🏟️ {{matchName}} غدًا!",
                "لا تنسَ! مباراة {{matchName}} غدًا الساعة {{time}} في {{stadium}}.");

        // ===== SECURITY ALERT =====
        save(NotificationType.SECURITY_ALERT, "fr",
                "⚠️ Alerte sécurité",
                "{{message}} Évite ce secteur.");
        save(NotificationType.SECURITY_ALERT, "en",
                "⚠️ Security alert",
                "{{message}} Avoid this area.");
        save(NotificationType.SECURITY_ALERT, "ar",
                "⚠️ تنبيه أمني",
                "{{message}} تجنّب هذه المنطقة.");

        // ===== BOOKING CONFIRMATION =====
        save(NotificationType.BOOKING_CONFIRMATION, "fr",
                "✅ Réservation confirmée",
                "Ta réservation à {{hotelName}} est confirmée pour le {{date}}.");
        save(NotificationType.BOOKING_CONFIRMATION, "en",
                "✅ Booking confirmed",
                "Your booking at {{hotelName}} is confirmed for {{date}}.");
        save(NotificationType.BOOKING_CONFIRMATION, "ar",
                "✅ تم تأكيد الحجز",
                "تم تأكيد حجزك في {{hotelName}} بتاريخ {{date}}.");

        // ===== PROXIMITY POI =====
        save(NotificationType.PROXIMITY_POI, "fr",
                "📍 {{poiName}} à proximité",
                "Tu es à {{distance}}m de {{poiName}}. {{description}}");
        save(NotificationType.PROXIMITY_POI, "en",
                "📍 {{poiName}} nearby",
                "You're {{distance}}m from {{poiName}}. {{description}}");
        save(NotificationType.PROXIMITY_POI, "ar",
                "📍 {{poiName}} قريب منك",
                "أنت على بُعد {{distance}} متر من {{poiName}}. {{description}}");

        // ===== WEATHER ALERT =====
        save(NotificationType.WEATHER_ALERT, "fr",
                "🌤️ Alerte météo - {{city}}",
                "{{message}}");
        save(NotificationType.WEATHER_ALERT, "en",
                "🌤️ Weather alert - {{city}}",
                "{{message}}");
        save(NotificationType.WEATHER_ALERT, "ar",
                "🌤️ تنبيه جوي - {{city}}",
                "{{message}}");

        // ===== FAN ZONE =====
        save(NotificationType.FAN_ZONE, "fr",
                "🎉 Fan zone à proximité",
                "Fan zone officielle à {{distance}}m ! Ambiance garantie pour {{matchName}}.");
        save(NotificationType.FAN_ZONE, "en",
                "🎉 Fan zone nearby",
                "Official fan zone {{distance}}m away! Great vibes for {{matchName}}.");
        save(NotificationType.FAN_ZONE, "ar",
                "🎉 منطقة المشجعين قريبة",
                "منطقة المشجعين الرسمية على بُعد {{distance}} متر! أجواء رائعة لـ {{matchName}}.");

        System.out.println("✅ " + templateRepo.count() + " templates insérés");
    }

    private void save(NotificationType type, String lang, String title, String body) {
        NotificationTemplate t = new NotificationTemplate();
        t.setType(type);
        t.setLanguage(lang);
        t.setTitleTemplate(title);
        t.setBodyTemplate(body);
        templateRepo.save(t);
    }
}