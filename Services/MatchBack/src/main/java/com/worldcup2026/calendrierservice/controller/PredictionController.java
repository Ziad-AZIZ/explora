package com.worldcup2026.calendrierservice.controller;

import com.worldcup2026.calendrierservice.dto.PredictionDTO;
import com.worldcup2026.calendrierservice.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wc2026/predictions")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    @GetMapping("/match/{id}")
    public ResponseEntity<PredictionDTO> getMatchPrediction(@PathVariable String id) {
        return predictionService.getMatchPrediction(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}
