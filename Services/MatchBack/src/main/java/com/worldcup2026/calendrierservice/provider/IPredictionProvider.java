package com.worldcup2026.calendrierservice.provider;

import com.fasterxml.jackson.databind.JsonNode;

public interface IPredictionProvider {
    /**
     * Récupère la liste des prédictions pour une date et une fédération données.
     */
    JsonNode fetchPredictions(String date, String federation);
}
