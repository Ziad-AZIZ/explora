package com.explora.notifications.controller;

import com.explora.notifications.dto.ApiResponse;
import com.explora.notifications.service.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    @Autowired
    private WeatherService weatherService;

    // GET /api/weather/check/{city}
    @GetMapping("/check/{city}")
    public ResponseEntity<ApiResponse> checkCity(@PathVariable String city) {
        try {
            weatherService.checkWeatherForCity(city);
            return ResponseEntity.ok(new ApiResponse(true, "Vérification météo lancée pour " + city));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Erreur : " + e.getMessage()));
        }
    }

    // GET /api/weather/check-all
    @GetMapping("/check-all")
    public ResponseEntity<ApiResponse> checkAll() {
        weatherService.checkWeather();
        return ResponseEntity.ok(new ApiResponse(true, "Vérification météo lancée pour toutes les villes"));
    }
}