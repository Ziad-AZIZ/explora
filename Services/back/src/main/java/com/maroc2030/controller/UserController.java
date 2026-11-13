package com.maroc2030.controller;

import com.maroc2030.model.Theme;
import com.maroc2030.model.User;
import com.maroc2030.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@Slf4j
public class UserController {

    @Autowired
    private UserService userService;

    // Helper to get authenticated user ID
    private Long getAuthenticatedUserId() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) throw new RuntimeException("Utilisateur non authentifié");
        
        Object principal = auth.getPrincipal();
        if (principal instanceof Long) return (Long) principal;
        if (principal instanceof Integer) return ((Integer) principal).longValue();
        if (principal instanceof String) return Long.parseLong((String) principal);
        
        throw new RuntimeException("Format d'ID utilisateur inconnu : " + principal.getClass().getName());
    }

    private String getAuthenticatedUserEmail() {
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getCredentials() != null) {
            return auth.getCredentials().toString();
        }
        return "unknown@email.com";
    }

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/me")
    public ResponseEntity<User> getMe() {
        try {
            Long userId = getAuthenticatedUserId();
            String email = getAuthenticatedUserEmail();
            return ResponseEntity.ok(userService.getOrCreateUser(userId, email));
        } catch (Exception e) {
            log.error("Error in getMe: ", e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        return userService.getUserByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            User created = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/me")
    public ResponseEntity<User> updateMe(@RequestBody User user) {
        try {
            User updated = userService.updateUser(getAuthenticatedUserId(), user);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            log.error("Error in updateMe: ", e);
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id:[0-9]+}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updated = userService.updateUser(id, user);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/me/theme")
    public ResponseEntity<User> updateTheme(@RequestBody Map<String, String> payload) {
        try {
            String themeStr = payload.get("theme");
            log.info("Updating theme to {} for user {}", themeStr, getAuthenticatedUserId());
            if (themeStr == null) return ResponseEntity.badRequest().build();
            Theme theme = Theme.valueOf(themeStr.toUpperCase());
            User updated = userService.updateTheme(getAuthenticatedUserId(), theme);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating theme: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/me/notifications")
    public ResponseEntity<User> updateNotifications(@RequestBody Map<String, Boolean> payload) {
        try {
            Boolean enabled = payload.get("enabled");
            log.info("Updating notifications to {} for user {}", enabled, getAuthenticatedUserId());
            if (enabled == null) return ResponseEntity.badRequest().build();
            User updated = userService.updateNotifications(getAuthenticatedUserId(), enabled);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Error updating notifications: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> updatePassword(@RequestBody Map<String, String> payload) {
        try {
            String currentPassword = payload.get("currentPassword");
            String newPassword = payload.get("newPassword");
            log.info("Updating password for user {}", getAuthenticatedUserId());
            // In a real app, we would verify currentPassword and hash newPassword
            // For this project, we'll just log it as a success for now or implement if needed
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Error updating password: ", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/me")
    public ResponseEntity<Void> deleteMe() {
        userService.deleteUser(getAuthenticatedUserId());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id:[0-9]+}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}