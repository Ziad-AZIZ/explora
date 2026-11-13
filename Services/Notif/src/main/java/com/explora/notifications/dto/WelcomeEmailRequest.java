package com.explora.notifications.dto;

import lombok.Data;

@Data
public class WelcomeEmailRequest {
    private String email;
    private String userName;
}