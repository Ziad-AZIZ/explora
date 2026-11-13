package com.pfa.auth.dto;

/**
 * DTO - Reponse d'authentification (login / signup).
 * ===================================================
 * Approche B : retourne uniquement le token JWT.
 * Les infos utilisateur seront recuperees via GET /api/users/me.
 */
public class AuthResponse {

    private String token;

    public AuthResponse(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}
