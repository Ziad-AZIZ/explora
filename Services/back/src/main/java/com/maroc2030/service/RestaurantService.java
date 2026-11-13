package com.maroc2030.service;

import com.maroc2030.model.Restaurant;
import com.maroc2030.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantRepository restaurantRepository;

    // Récupérer tous les restaurants
    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    // Récupérer un restaurant par ID
    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }

    // Récupérer les restaurants par ville
    public List<Restaurant> getRestaurantsByCity(String city) {
        return restaurantRepository.findByCity(city);
    }

    // Récupérer les restaurants disponibles
    public List<Restaurant> getAvailableRestaurants() {
        return restaurantRepository.findByAvailable(true);
    }

    // Récupérer les restaurants par cuisine
    public List<Restaurant> getRestaurantsByCuisine(String cuisine) {
        return restaurantRepository.findByCuisine(cuisine);
    }

    // Récupérer les restaurants par gamme de prix
    public List<Restaurant> getRestaurantsByPriceRange(String priceRange) {
        return restaurantRepository.findByPriceRange(priceRange);
    }

    // Récupérer les restaurants avec livraison
    public List<Restaurant> getRestaurantsWithDelivery() {
        return restaurantRepository.findByHasDelivery(true);
    }

    // Récupérer les restaurants avec réservation
    public List<Restaurant> getRestaurantsWithReservation() {
        return restaurantRepository.findByHasReservation(true);
    }

    // Créer un nouveau restaurant
    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    // Mettre à jour un restaurant
    public Restaurant updateRestaurant(Long id, Restaurant restaurantDetails) {
        Optional<Restaurant> optionalRestaurant = restaurantRepository.findById(id);

        if (optionalRestaurant.isPresent()) {
            Restaurant restaurant = optionalRestaurant.get();

            restaurant.setName(restaurantDetails.getName());
            restaurant.setCity(restaurantDetails.getCity());
            restaurant.setDescription(restaurantDetails.getDescription());
            restaurant.setPriceRange(restaurantDetails.getPriceRange());
            restaurant.setRating(restaurantDetails.getRating());
            restaurant.setAddress(restaurantDetails.getAddress());
            restaurant.setPhone(restaurantDetails.getPhone());
            restaurant.setEmail(restaurantDetails.getEmail());
            restaurant.setImageUrl(restaurantDetails.getImageUrl());
            restaurant.setCuisine(restaurantDetails.getCuisine());
            restaurant.setMenu(restaurantDetails.getMenu());
            restaurant.setOpeningHours(restaurantDetails.getOpeningHours());
            restaurant.setAvailable(restaurantDetails.getAvailable());
            restaurant.setLatitude(restaurantDetails.getLatitude());
            restaurant.setLongitude(restaurantDetails.getLongitude());
            restaurant.setCapacity(restaurantDetails.getCapacity());
            restaurant.setHasDelivery(restaurantDetails.getHasDelivery());
            restaurant.setHasReservation(restaurantDetails.getHasReservation());

            return restaurantRepository.save(restaurant);
        }

        throw new RuntimeException("Restaurant not found with id: " + id);
    }

    // Supprimer un restaurant
    public void deleteRestaurant(Long id) {
        restaurantRepository.deleteById(id);
    }
}