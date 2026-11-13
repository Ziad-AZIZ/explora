package com.pfa.auth.controller;

import com.pfa.auth.dto.UpdateProfileRequest;
import com.pfa.auth.dto.UserResponse;
import com.pfa.auth.security.JwtService;
import com.pfa.auth.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * CONTROLLER - Gestion du profil utilisateur (C de MVC)
 * =====================================================
 * Expose les routes /api/users/me pour consulter et modifier
 * son propre profil. L'identite est extraite du JWT — aucun
 * id dans l'URL, ce qui elimine les vulnerabilites IDOR.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserService userService, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * GET /api/users/me
     * Recupere les infos de l'utilisateur authentifie (id extrait du JWT).
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMe(HttpServletRequest request) {
        Long userId = extractUserIdFromRequest(request);
        try {
            UserResponse user = userService.getById(userId);
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * PUT /api/users/me
     * Met a jour le nom et/ou la photo de profil de l'utilisateur authentifie.
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(HttpServletRequest request,
                                       @Valid @RequestBody UpdateProfileRequest body) {
        Long userId = extractUserIdFromRequest(request);
        try {
            UserResponse updated = userService.updateProfile(userId, body);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(HttpServletRequest request,
                                           @RequestBody Map<String, String> body) {
        Long userId = extractUserIdFromRequest(request);
        try {
            userService.updatePassword(
                    userId, 
                    body.get("currentPassword"), 
                    body.get("newPassword"), 
                    passwordEncoder
            );
            return ResponseEntity.ok(Map.of("message", "Mot de passe mis à jour"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // ====================== HELPER ======================

    /**
     * Extrait le userId depuis le header Authorization: Bearer <token>.
     */
    private Long extractUserIdFromRequest(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        String token = header.substring(7); // enlever "Bearer "
        return jwtService.extractUserId(token);
    }
}
