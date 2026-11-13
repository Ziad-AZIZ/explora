package com.maroc2030.repository;

import com.maroc2030.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByCity(String city);
    List<Hotel> findByAvailable(Boolean available);
    List<Hotel> findByCityAndAvailable(String city, Boolean available);
    List<Hotel> findByPriceBetween(Double minPrice, Double maxPrice);
    List<Hotel> findByRatingGreaterThanEqual(Double minRating);
    List<Hotel> findByStars(Integer stars);
}