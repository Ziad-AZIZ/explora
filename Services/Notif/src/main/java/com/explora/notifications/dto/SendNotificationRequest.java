package com.explora.notifications.dto;

import com.explora.notifications.enums.NotificationType;
import lombok.Data;

@Data
public class SendNotificationRequest {
    private Long userId;
    private String title;
    private String body;
    private NotificationType type;
}