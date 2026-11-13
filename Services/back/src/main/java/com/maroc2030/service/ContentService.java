package com.maroc2030.service;

import com.maroc2030.model.Hotel;
import com.maroc2030.model.Restaurant;
import com.maroc2030.repository.HotelRepository;
import com.maroc2030.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ContentService {

    @Autowired
    private HotelRepository hotelRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;



    // ============================================
    // HOTELS
    // ============================================

    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }

    public Optional<Hotel> getHotelById(Long id) {
        return hotelRepository.findById(id);
    }

    public List<Hotel> getHotelsByCity(String city) {
        return hotelRepository.findByCity(city);
    }

    public List<Hotel> getAvailableHotels() {
        return hotelRepository.findByAvailable(true);
    }

    public Hotel createHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }

    public Hotel updateHotel(Long id, Hotel hotelDetails) {
        Hotel hotel = hotelRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hotel not found"));

        hotel.setName(hotelDetails.getName());
        hotel.setCity(hotelDetails.getCity());
        hotel.setDescription(hotelDetails.getDescription());
        hotel.setPrice(hotelDetails.getPrice());
        hotel.setRating(hotelDetails.getRating());
        hotel.setAddress(hotelDetails.getAddress());
        hotel.setPhone(hotelDetails.getPhone());
        hotel.setEmail(hotelDetails.getEmail());
        hotel.setImageUrl(hotelDetails.getImageUrl());
        hotel.setAmenities(hotelDetails.getAmenities());
        hotel.setDistanceFromStadium(hotelDetails.getDistanceFromStadium());
        hotel.setAvailable(hotelDetails.getAvailable());
        hotel.setLatitude(hotelDetails.getLatitude());
        hotel.setLongitude(hotelDetails.getLongitude());
        hotel.setStars(hotelDetails.getStars());

        return hotelRepository.save(hotel);
    }

    public void deleteHotel(Long id) {
        hotelRepository.deleteById(id);
    }

    // ============================================
    // RESTAURANTS
    // ============================================

    public List<Restaurant> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public Optional<Restaurant> getRestaurantById(Long id) {
        return restaurantRepository.findById(id);
    }

    public List<Restaurant> getRestaurantsByCity(String city) {
        return restaurantRepository.findByCity(city);
    }

    public List<Restaurant> getAvailableRestaurants() {
        return restaurantRepository.findByAvailable(true);
    }

    public List<Restaurant> getRestaurantsByCuisine(String cuisine) {
        return restaurantRepository.findByCuisine(cuisine);
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public Restaurant updateRestaurant(Long id, Restaurant restaurantDetails) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        restaurant.setName(restaurantDetails.getName());
        restaurant.setCity(restaurantDetails.getCity());
        restaurant.setDescription(restaurantDetails.getDescription());
        restaurant.setCuisine(restaurantDetails.getCuisine());
        restaurant.setPriceRange(restaurantDetails.getPriceRange());
        restaurant.setRating(restaurantDetails.getRating());
        restaurant.setAddress(restaurantDetails.getAddress());
        restaurant.setPhone(restaurantDetails.getPhone());
        restaurant.setEmail(restaurantDetails.getEmail());
        restaurant.setImageUrl(restaurantDetails.getImageUrl());
        restaurant.setOpeningHours(restaurantDetails.getOpeningHours());
        restaurant.setAvailable(restaurantDetails.getAvailable());
        restaurant.setLatitude(restaurantDetails.getLatitude());
        restaurant.setLongitude(restaurantDetails.getLongitude());
        restaurant.setCapacity(restaurantDetails.getCapacity());
        restaurant.setHasDelivery(restaurantDetails.getHasDelivery());
        restaurant.setHasReservation(restaurantDetails.getHasReservation());
        restaurant.setMenu(restaurantDetails.getMenu());

        return restaurantRepository.save(restaurant);
    }

    public void deleteRestaurant(Long id) {
        restaurantRepository.deleteById(id);
    }


}