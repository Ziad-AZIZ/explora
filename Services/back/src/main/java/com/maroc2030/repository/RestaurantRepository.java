package com.maroc2030.repository;

import com.maroc2030.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {

    // Recherche par ville
    List<Restaurant> findByCity(String city);

    // Recherche par disponibilité
    List<Restaurant> findByAvailable(Boolean available);

    // Recherche par ville ET disponibilité
    List<Restaurant> findByCityAndAvailable(String city, Boolean available);

    // Recherche par type de cuisine
    List<Restaurant> findByCuisine(String cuisine);

    // Recherche par gamme de prix
    List<Restaurant> findByPriceRange(String priceRange);

    // Recherche par note minimum
    List<Restaurant> findByRatingGreaterThanEqual(Double minRating);

    // Recherche restaurants avec livraison
    List<Restaurant> findByHasDelivery(Boolean hasDelivery);

    // Recherche restaurants avec réservation
    List<Restaurant> findByHasReservation(Boolean hasReservation);

    // Recherche par cuisine ET ville
    List<Restaurant> findByCuisineAndCity(String cuisine, String city);
}