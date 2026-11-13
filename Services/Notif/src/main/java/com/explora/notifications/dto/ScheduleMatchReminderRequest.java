package com.explora.notifications.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ScheduleMatchReminderRequest {
    private Long userId;
    private String matchName;        // ex: "Maroc vs France"
    private String stadium;          // ex: "Grand Stade de Casablanca"
    private LocalDateTime matchDate; // ex: 2026-06-15T20:00:00
}