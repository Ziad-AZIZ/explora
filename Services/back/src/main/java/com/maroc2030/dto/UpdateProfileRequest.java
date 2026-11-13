package com.maroc2030.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String fullName;
    private String phoneNumber;
    private String city;
    private String profileImageUrl;
}