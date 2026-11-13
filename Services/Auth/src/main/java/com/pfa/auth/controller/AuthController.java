package com.pfa.auth.controller;

import com.pfa.auth.dto.AuthResponse;
import com.pfa.auth.dto.LoginRequest;
import com.pfa.auth.dto.SignupRequest;
import com.pfa.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * CONTROLLER - Authentification (C de MVC)
 * ========================================
 * Expose les routes HTTP pour le signup et le login.
 * Aucune logique metier ici : tout est delegue a AuthService.
 *
 * Les deux endpoints retournent un AuthResponse contenant uniquement le token JWT.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/signup
     * Cree un nouveau compte utilisateur et retourne un token JWT.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request) {
        try {
            AuthResponse response = authService.signup(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * POST /api/auth/login
     * Authentifie un utilisateur et retourne un token JWT.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
