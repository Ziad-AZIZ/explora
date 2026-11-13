package com.explora.notifications.dto;

import lombok.Data;

@Data
public class PasswordResetEmailRequest {
    private String email;
    private String userName;
    private String resetLink;
}