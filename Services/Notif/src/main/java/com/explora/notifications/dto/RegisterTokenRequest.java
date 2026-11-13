package com.explora.notifications.dto;
import lombok.Data;

@Data
public class RegisterTokenRequest {
    private Long userId;
    private String token;
    private String platform;  // "android" ou "ios"
    private String language;  // "fr", "en", "ar"
}
