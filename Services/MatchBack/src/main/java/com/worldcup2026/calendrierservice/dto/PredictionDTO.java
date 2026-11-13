package com.worldcup2026.calendrierservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictionDTO {
    private int pctDomicile; // Pourcentage
    private int pctNul;      // Pourcentage
    private int pctExterieur; // Pourcentage
    private String matchId;
}
