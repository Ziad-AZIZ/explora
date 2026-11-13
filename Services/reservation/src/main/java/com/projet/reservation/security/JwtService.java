package com.projet.reservation.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

/**
 * SERVICE JWT - Validation uniquement (pas de generation de token).
 * ==================================================================
 * Ce service utilise le MEME secret que le service Auth pour valider
 * les tokens JWT emis par l'Auth service.
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    /**
     * Extrait l'id utilisateur (claim "id") depuis le token.
     */
    public Long extractUserId(String token) {
        Object id = extractAllClaims(token).get("id");
        if (id instanceof Integer) return ((Integer) id).longValue();
        return (Long) id;
    }

    /**
     * Extrait l'email (subject) depuis le token.
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Verifie que le token est valide (signature correcte + non expire).
     */
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
