package com.explora.notifications.service;

import com.explora.notifications.dto.SendNotificationRequest;
import com.explora.notifications.entity.UserLocation;
import com.explora.notifications.enums.NotificationType;
import com.explora.notifications.repository.UserLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class WeatherService {

    @Value("${openweather.api.key}")
    private String apiKey;

    @Value("${openweather.api.url}")
    private String apiUrl;

    @Autowired
    private UserLocationRepository userLocationRepo;

    @Autowired
    private TemplateService templateService;

    @Autowired
    private NotificationService notificationService;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final List<String> CITIES_TO_MONITOR = List.of(
            "Casablanca", "Rabat", "Marrakech", "Fes", "Tangier", "Agadir"
    );

    /**
     * Toutes les 3 heures, vérifier la météo et notifier si nécessaire.
     * Pour tester rapidement : mets fixedRate=60000 (1 min)
     */
    @Scheduled(fixedRate = 3 * 60 * 60 * 1000) // 3 heures
    public void checkWeather() {
        System.out.println("🌤️ Vérification météo en cours...");

        for (String city : CITIES_TO_MONITOR) {
            try {
                checkWeatherForCity(city);
            } catch (Exception e) {
                System.err.println("❌ Erreur météo " + city + " : " + e.getMessage());
            }
        }
    }

    public void checkWeatherForCity(String city) {
        // 1. Appeler l'API OpenWeatherMap
        String url = apiUrl + "?q=" + city + ",MA&appid=" + apiKey + "&units=metric&lang=fr";

        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        if (response == null) return;

        // 2. Extraire les données
        Map<String, Object> main = (Map<String, Object>) response.get("main");
        List<Map<String, Object>> weatherList = (List<Map<String, Object>>) response.get("weather");

        if (main == null || weatherList == null || weatherList.isEmpty()) return;

        Double temp = ((Number) main.get("temp")).doubleValue();
        String mainCondition = (String) weatherList.get(0).get("main");
        String description = (String) weatherList.get(0).get("description");

        System.out.println("🌡️ " + city + " : " + temp + "°C, " + description);

        // 3. Détecter les conditions critiques
        String alertMessage = null;

        if (temp >= 40) {
            alertMessage = "🔥 Canicule à " + city + " — " + temp.intValue()
                    + "°C. Bois beaucoup d'eau, évite le soleil entre 12h et 16h.";
        } else if (mainCondition.equalsIgnoreCase("Rain") || mainCondition.equalsIgnoreCase("Drizzle")) {
            alertMessage = "☔ Pluie en cours à " + city + ". Pense à prendre un parapluie.";
        } else if (mainCondition.equalsIgnoreCase("Thunderstorm")) {
            alertMessage = "⛈️ Orage à " + city + ". Reste à l'intérieur si possible.";
        } else if (mainCondition.equalsIgnoreCase("Snow")) {
            alertMessage = "❄️ Neige à " + city + ". Conduis prudemment.";
        }

        // 4. Si alerte → notifier les users dans cette ville
        if (alertMessage != null) {
            notifyUsersInCity(city, alertMessage);
        }
    }

    private void notifyUsersInCity(String city, String message) {
        List<UserLocation> users = userLocationRepo.findByCity(city);

        if (users.isEmpty()) {
            System.out.println("ℹ️ Aucun user à " + city);
            return;
        }

        System.out.println("📢 " + users.size() + " user(s) à notifier à " + city);

        for (UserLocation u : users) {
            String[] templated = templateService.buildMessage(
                    NotificationType.WEATHER_ALERT,
                    u.getLanguage() != null ? u.getLanguage() : "fr",
                    Map.of("city", city, "message", message)
            );

            if (templated == null) continue;

            SendNotificationRequest req = new SendNotificationRequest();
            req.setUserId(u.getUserId());
            req.setTitle(templated[0]);
            req.setBody(templated[1]);
            req.setType(NotificationType.WEATHER_ALERT);
            notificationService.sendNotificationToUser(req);
        }
    }
}