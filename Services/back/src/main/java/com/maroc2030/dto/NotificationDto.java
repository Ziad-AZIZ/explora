package com.maroc2030.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class NotificationDto {
    private Long id;
    private String title;
    private String message;
    private String type;
    private Long relatedEntityId;
    private String relatedEntityType;
    private Boolean isRead;
    private LocalDateTime scheduledFor;
    private LocalDateTime createdAt;
}