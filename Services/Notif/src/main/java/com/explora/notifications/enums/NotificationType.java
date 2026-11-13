package com.explora.notifications.enums;

public enum NotificationType {
    // Notifications PUSH
    MATCH_REMINDER,        // 🏟️ Rappel de match
    SECURITY_ALERT,        // 🚨 Alerte sécurité
    BOOKING_CONFIRMATION,  // ✅ Confirmation réservation
    PROXIMITY_POI,         // 📍 Monument à proximité
    WEATHER_ALERT,         // 🌤️ Alerte météo
    FAN_ZONE,              // 🎉 Fan zone à proximité

    // Notifications EMAIL
    WELCOME_EMAIL,         // Email de bienvenue
    PASSWORD_RESET,        // Reset mot de passe
    EMAIL_VERIFICATION     // Vérification email
}