package com.explora.notifications.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

/**
 * SERVICE JWT - Validation uniquement (pas de generation de token).
 * Utilise le MEME secret que le service Auth.
 */
@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;

    public Long extractUserId(String token) {
        Object id = extractAllClaims(token).get("id");
        if (id == null) return null;
        if (id instanceof Number) return ((Number) id).longValue();
        if (id instanceof String) return Long.parseLong((String) id);
        return (Long) id;
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

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
