package com.pfa.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO - Requete de mise a jour du profil (PUT /api/users/{id})
 */
public class UpdateProfileRequest {

    @NotBlank(message = "Le nom est obligatoire")
    private String name;

    private String profilePic;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getProfilePic() { return profilePic; }
    public void setProfilePic(String profilePic) { this.profilePic = profilePic; }
}
