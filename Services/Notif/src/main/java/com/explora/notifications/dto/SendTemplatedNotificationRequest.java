package com.explora.notifications.dto;

import com.explora.notifications.enums.NotificationType;
import lombok.Data;

import java.util.Map;

@Data
public class SendTemplatedNotificationRequest {
    private Long userId;
    private NotificationType type;
    private String language;             // "fr", "en", "ar"
    private Map<String, String> variables;
}