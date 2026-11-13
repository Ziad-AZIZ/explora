package com.maroc2030.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String preferredLanguage;
    private String favoriteTeam;
    private String profileImageUrl;
    private String city;
    private Boolean notificationsEnabled;
    private Boolean matchNotifications;
    private Boolean reservationNotifications;
    private Boolean activityReminders;
    private LocalDateTime createdAt;
}