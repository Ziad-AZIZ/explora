package com.maroc2030.service;

import com.maroc2030.model.*;
import com.maroc2030.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;



    public List<Favorite> getAllFavorites() {
        return favoriteRepository.findAll();
    }

    public List<Favorite> getUserFavorites(Long userId) {
        return favoriteRepository.findByUserId(userId);
    }

    public List<Favorite> getUserFavoritesByType(Long userId, FavoriteType type) {
        return favoriteRepository.findByUserIdAndType(userId, type);
    }

    // Récupérer les favoris avec détails complets
    public Map<String, Object> getUserFavoritesWithDetails(Long userId) {
        System.out.println("🔍 Récupération des détails des favoris pour userId: " + userId);
        List<Favorite> favorites = favoriteRepository.findByUserId(userId);
        System.out.println("📋 Nombre de favoris bruts trouvés en base: " + favorites.size());

        List<Hotel> hotels = new ArrayList<>();
        List<Restaurant> restaurants = new ArrayList<>();

        for (Favorite fav : favorites) {
            switch (fav.getType()) {
                case HOTEL:
                    hotelRepository.findById(fav.getItemId()).ifPresentOrElse(
                        hotels::add,
                        () -> System.out.println("⚠️ Hôtel ID " + fav.getItemId() + " introuvable dans la table hotels")
                    );
                    break;
                case RESTAURANT:
                    restaurantRepository.findById(fav.getItemId()).ifPresentOrElse(
                        restaurants::add,
                        () -> System.out.println("⚠️ Restaurant ID " + fav.getItemId() + " introuvable dans la table restaurants")
                    );
                    break;
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("hotels", hotels);
        result.put("restaurants", restaurants);
        result.put("totalCount", favorites.size());
        
        System.out.println("✅ Retour: " + hotels.size() + " hôtels, " + restaurants.size() + " restaurants");
        return result;
    }

    public Favorite addFavorite(Long userId, Long itemId, FavoriteType type) {
        // Vérifier si déjà en favoris
        if (favoriteRepository.existsByUserIdAndItemIdAndType(userId, itemId, type)) {
            throw new RuntimeException("Already in favorites");
        }

        Favorite favorite = new Favorite();
        favorite.setUserId(userId);
        favorite.setItemId(itemId);
        favorite.setType(type);

        return favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(Long userId, Long itemId, FavoriteType type) {
        favoriteRepository.deleteByUserIdAndItemIdAndType(userId, itemId, type);
    }

    public void deleteFavorite(Long id) {
        favoriteRepository.deleteById(id);
    }

    public boolean isFavorite(Long userId, Long itemId, FavoriteType type) {
        return favoriteRepository.existsByUserIdAndItemIdAndType(userId, itemId, type);
    }
}