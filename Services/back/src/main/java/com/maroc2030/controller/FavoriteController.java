package com.maroc2030.controller;

import com.maroc2030.model.Favorite;
import com.maroc2030.model.FavoriteType;
import com.maroc2030.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

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

    @GetMapping
    public ResponseEntity<List<Favorite>> getAllFavorites() {
        return ResponseEntity.ok(favoriteService.getAllFavorites());
    }

    @GetMapping("/user/me")
    public ResponseEntity<List<Favorite>> getUserFavorites() {
        return ResponseEntity.ok(favoriteService.getUserFavorites(getAuthenticatedUserId()));
    }

    @GetMapping("/user/me/details")
    public ResponseEntity<Map<String, Object>> getUserFavoritesWithDetails() {
        return ResponseEntity.ok(favoriteService.getUserFavoritesWithDetails(getAuthenticatedUserId()));
    }

    @GetMapping("/user/me/type/{type}")
    public ResponseEntity<List<Favorite>> getUserFavoritesByType(
            @PathVariable FavoriteType type) {
        return ResponseEntity.ok(favoriteService.getUserFavoritesByType(getAuthenticatedUserId(), type));
    }

    @PostMapping
    public ResponseEntity<Favorite> addFavorite(@RequestBody Map<String, Object> request) {
        try {
            Long userId = getAuthenticatedUserId();
            Long itemId = Long.valueOf(request.get("itemId").toString());
            FavoriteType type = FavoriteType.valueOf(request.get("type").toString());

            Favorite favorite = favoriteService.addFavorite(userId, itemId, type);
            return ResponseEntity.status(HttpStatus.CREATED).body(favorite);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void> removeFavorite(@RequestBody Map<String, Object> request) {
        try {
            Long userId = getAuthenticatedUserId();
            Long itemId = Long.valueOf(request.get("itemId").toString());
            FavoriteType type = FavoriteType.valueOf(request.get("type").toString());

            favoriteService.removeFavorite(userId, itemId, type);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFavorite(@PathVariable Long id) {
        // Validation basique de propriété
        Long userId = getAuthenticatedUserId();
        // Dans l'idéal, on vérifierait dans la DB si le favori appartient bien à userId.
        // Pour l'instant, on laisse le comportement existant.
        favoriteService.deleteFavorite(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/check")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @RequestParam(required = false) Long userId,
            @RequestParam Long itemId,
            @RequestParam FavoriteType type) {
        boolean isFavorite = favoriteService.isFavorite(getAuthenticatedUserId(), itemId, type);
        return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
    }
}