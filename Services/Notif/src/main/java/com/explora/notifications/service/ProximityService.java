package com.explora.notifications.service;

import com.explora.notifications.dto.ProximityCheckRequest;
import com.explora.notifications.entity.PointOfInterest;
import com.explora.notifications.entity.ProximityNotificationLog;
import com.explora.notifications.entity.UserLocation;
import com.explora.notifications.enums.NotificationType;
import com.explora.notifications.repository.PointOfInterestRepository;
import com.explora.notifications.repository.ProximityNotificationLogRepository;
import com.explora.notifications.repository.UserLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ProximityService {

    // Distance en mètres pour déclencher une notif
    private static final double PROXIMITY_RADIUS_METERS = 200.0;

    // Délai en heures avant de pouvoir renotifier le même POI au même user
    private static final int ANTI_SPAM_HOURS = 24;

    @Autowired
    private PointOfInterestRepository poiRepo;

    @Autowired
    private ProximityNotificationLogRepository logRepo;

    @Autowired
    private TemplateService templateService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserLocationRepository userLocationRepo;

    /**
     * Vérifie si l'user est proche d'un POI et envoie une notif si nécessaire.
     */
    public List<String> checkProximity(ProximityCheckRequest request) {
        List<String> notificationsTriggered = new ArrayList<>();

        // 0. Mettre à jour la dernière position connue
        UserLocation loc = userLocationRepo.findByUserId(request.getUserId())
                .orElse(new UserLocation());
        loc.setUserId(request.getUserId());
        loc.setLatitude(request.getLatitude());
        loc.setLongitude(request.getLongitude());
        loc.setLanguage(request.getLanguage());
        loc.setCity(detectCity(request.getLatitude(), request.getLongitude()));
        loc.setUpdatedAt(LocalDateTime.now());
        userLocationRepo.save(loc);

        // 1. Récupérer tous les POIs
        List<PointOfInterest> allPois = poiRepo.findAll();

        // 2. Pour chaque POI, calculer la distance
        for (PointOfInterest poi : allPois) {
            double distance = haversineDistance(
                    request.getLatitude(), request.getLongitude(),
                    poi.getLatitude(), poi.getLongitude()
            );

            // 3. Si dans le rayon
            if (distance <= PROXIMITY_RADIUS_METERS) {

                // 4. Anti-spam
                LocalDateTime since = LocalDateTime.now().minusHours(ANTI_SPAM_HOURS);
                boolean alreadyNotified = logRepo
                        .findFirstByUserIdAndPoiIdAndNotifiedAtAfter(
                                request.getUserId(), poi.getId(), since)
                        .isPresent();

                if (alreadyNotified) {
                    System.out.println("⏭️ Déjà notifié pour " + poi.getName() + " (skip)");
                    continue;
                }

                // 5. Choisir le bon type de notification selon la catégorie
                NotificationType notifType;
                Map<String, String> variables;

                if ("fan_zone".equals(poi.getCategory())) {
                    notifType = NotificationType.FAN_ZONE;
                    variables = Map.of(
                            "distance", String.valueOf((int) distance),
                            "matchName", poi.getDescription() != null ? poi.getDescription() : "le prochain match"
                    );
                } else {
                    notifType = NotificationType.PROXIMITY_POI;
                    variables = Map.of(
                            "poiName", poi.getName(),
                            "distance", String.valueOf((int) distance),
                            "description", poi.getDescription() != null ? poi.getDescription() : ""
                    );
                }

                // 6. Construire le message via le système de templates
                String[] message = templateService.buildMessage(
                        notifType,
                        request.getLanguage(),
                        variables
                );

                if (message == null) {
                    System.err.println("❌ Pas de template " + notifType);
                    continue;
                }

                // 7. Envoyer la notification
                com.explora.notifications.dto.SendNotificationRequest sendReq =
                        new com.explora.notifications.dto.SendNotificationRequest();
                sendReq.setUserId(request.getUserId());
                sendReq.setTitle(message[0]);
                sendReq.setBody(message[1]);
                sendReq.setType(notifType);

                notificationService.sendNotificationToUser(sendReq);

                // 8. Logger
                ProximityNotificationLog log = new ProximityNotificationLog();
                log.setUserId(request.getUserId());
                log.setPoiId(poi.getId());
                log.setNotifiedAt(LocalDateTime.now());
                logRepo.save(log);

                notificationsTriggered.add(poi.getName() + " (" + (int) distance + "m)");
                System.out.println("📍 Proximité détectée : " + poi.getName() + " à " + (int) distance + "m [" + notifType + "]");
            }
        }

        return notificationsTriggered;
    }

    /**
     * Formule de Haversine : calcule la distance entre 2 points GPS sur la Terre.
     */
    private double haversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final double EARTH_RADIUS_M = 6_371_000;

        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_M * c;
    }

    /**
     * Détecte la ville la plus proche d'une position GPS.
     */
    private String detectCity(double lat, double lon) {
        Map<String, double[]> cities = Map.of(
                "Casablanca", new double[]{33.5731, -7.5898},
                "Rabat", new double[]{34.0209, -6.8416},
                "Marrakech", new double[]{31.6295, -7.9811},
                "Fès", new double[]{34.0181, -5.0078},
                "Tanger", new double[]{35.7595, -5.8340},
                "Agadir", new double[]{30.4278, -9.5981},
                "Chefchaouen", new double[]{35.1689, -5.2636}
        );

        String closestCity = "Casablanca";
        double minDistance = Double.MAX_VALUE;

        for (var entry : cities.entrySet()) {
            double d = haversineDistance(lat, lon, entry.getValue()[0], entry.getValue()[1]);
            if (d < minDistance) {
                minDistance = d;
                closestCity = entry.getKey();
            }
        }
        return closestCity;
    }
}