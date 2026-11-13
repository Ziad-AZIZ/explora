package com.pfa.auth.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO - Requete de connexion (POST /api/auth/login)
 * L'utilisateur peut se connecter avec son email OU son username.
 */
public class LoginRequest {

    @NotBlank(message = "L'identifiant est obligatoire")
    private String emailOrUsername;

    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;

    public String getEmailOrUsername() { return emailOrUsername; }
    public void setEmailOrUsername(String emailOrUsername) { this.emailOrUsername = emailOrUsername; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}
