package com.maroc2030.service;

import com.maroc2030.model.Hotel;
import com.maroc2030.repository.HotelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class HotelService {

    @Autowired
    private HotelRepository hotelRepository;

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
}