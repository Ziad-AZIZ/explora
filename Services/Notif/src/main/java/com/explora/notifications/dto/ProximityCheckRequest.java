package com.explora.notifications.dto;

import lombok.Data;

@Data
public class ProximityCheckRequest {
    private Long userId;
    private Double latitude;
    private Double longitude;
    private String language;  // "fr", "en", "ar", "es"
}