package com.worldcup2026.calendrierservice.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Component
public class RapidApiPredictionProvider implements IPredictionProvider {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public RapidApiPredictionProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    @Override
    public JsonNode fetchPredictions(String date, String federation) {
        String url = String.format("https://football-prediction-api.p.rapidapi.com/api/v2/predictions?market=classic&iso_date=%s&federation=%s", date, federation);
        
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("x-rapidapi-key", "8c3b1e9a47msh5d827c1493b214bp197b40jsn876db86e36b5")
                    .header("x-rapidapi-host", "football-prediction-api.p.rapidapi.com")
                    .header("Content-Type", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            JsonNode root = objectMapper.readTree(response.body());
            
            // Si l'API renvoie une erreur (ex: limite atteinte, non souscrit), 
            // root.path("data") renverra un MissingNode et le service le gèrera proprement.
            return root.path("data");
        } catch (Throwable t) { // On catch Throwable pour éviter tout crash serveur (500)
            t.printStackTrace();
            return objectMapper.createArrayNode();
        }
    }
}
