package com.maroc2030.controller;

import com.maroc2030.model.Restaurant;
import com.maroc2030.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    // GET /api/restaurants - Récupérer tous les restaurants
    @GetMapping
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        List<Restaurant> restaurants = restaurantService.getAllRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    // GET /api/restaurants/{id} - Récupérer un restaurant par ID
    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getRestaurantById(@PathVariable Long id) {
        Optional<Restaurant> restaurant = restaurantService.getRestaurantById(id);
        return restaurant.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/restaurants/city/{city} - Récupérer les restaurants d'une ville
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByCity(@PathVariable String city) {
        List<Restaurant> restaurants = restaurantService.getRestaurantsByCity(city);
        return ResponseEntity.ok(restaurants);
    }

    // GET /api/restaurants/available - Récupérer les restaurants disponibles
    @GetMapping("/available")
    public ResponseEntity<List<Restaurant>> getAvailableRestaurants() {
        List<Restaurant> restaurants = restaurantService.getAvailableRestaurants();
        return ResponseEntity.ok(restaurants);
    }

    // GET /api/restaurants/cuisine/{cuisine} - Récupérer par type de cuisine
    @GetMapping("/cuisine/{cuisine}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByCuisine(@PathVariable String cuisine) {
        List<Restaurant> restaurants = restaurantService.getRestaurantsByCuisine(cuisine);
        return ResponseEntity.ok(restaurants);
    }

    // GET /api/restaurants/price/{priceRange} - Récupérer par gamme de prix
    @GetMapping("/price/{priceRange}")
    public ResponseEntity<List<Restaurant>> getRestaurantsByPriceRange(@PathVariable String priceRange) {
        List<Restaurant> restaurants = restaurantService.getRestaurantsByPriceRange(priceRange);
        return ResponseEntity.ok(restaurants);
    }

    // GET /api/restaurants/delivery - Récupérer restaurants avec livraison
    @GetMapping("/delivery")
    public ResponseEntity<List<Restaurant>> getRestaurantsWithDelivery() {
        List<Restaurant> restaurants = restaurantService.getRestaurantsWithDelivery();
        return ResponseEntity.ok(restaurants);
    }

    // GET /api/restaurants/reservation - Récupérer restaurants avec réservation
    @GetMapping("/reservation")
    public ResponseEntity<List<Restaurant>> getRestaurantsWithReservation() {
        List<Restaurant> restaurants = restaurantService.getRestaurantsWithReservation();
        return ResponseEntity.ok(restaurants);
    }

    // POST /api/restaurants - Créer un nouveau restaurant
    @PostMapping
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        Restaurant createdRestaurant = restaurantService.createRestaurant(restaurant);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdRestaurant);
    }

    // PUT /api/restaurants/{id} - Mettre à jour un restaurant
    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(
            @PathVariable Long id,
            @RequestBody Restaurant restaurant) {
        try {
            Restaurant updatedRestaurant = restaurantService.updateRestaurant(id, restaurant);
            return ResponseEntity.ok(updatedRestaurant);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/restaurants/{id} - Supprimer un restaurant
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRestaurant(@PathVariable Long id) {
        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }
}