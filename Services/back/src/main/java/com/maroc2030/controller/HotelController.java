package com.maroc2030.controller;

import com.maroc2030.model.Hotel;
import com.maroc2030.service.HotelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*")
public class HotelController {

    @Autowired
    private HotelService hotelService;

    // GET /api/hotels - Récupérer tous les hôtels
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        List<Hotel> hotels = hotelService.getAllHotels();
        return ResponseEntity.ok(hotels);
    }

    // GET /api/hotels/{id} - Récupérer un hôtel par ID
    @GetMapping("/{id}")
    public ResponseEntity<Hotel> getHotelById(@PathVariable Long id) {
        Optional<Hotel> hotel = hotelService.getHotelById(id);
        return hotel.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // GET /api/hotels/city/{city} - Récupérer les hôtels d'une ville
    @GetMapping("/city/{city}")
    public ResponseEntity<List<Hotel>> getHotelsByCity(@PathVariable String city) {
        List<Hotel> hotels = hotelService.getHotelsByCity(city);
        return ResponseEntity.ok(hotels);
    }

    // GET /api/hotels/available - Récupérer les hôtels disponibles
    @GetMapping("/available")
    public ResponseEntity<List<Hotel>> getAvailableHotels() {
        List<Hotel> hotels = hotelService.getAvailableHotels();
        return ResponseEntity.ok(hotels);
    }

    // POST /api/hotels - Créer un nouvel hôtel
    @PostMapping
    public ResponseEntity<Hotel> createHotel(@RequestBody Hotel hotel) {
        Hotel createdHotel = hotelService.createHotel(hotel);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdHotel);
    }

    // PUT /api/hotels/{id} - Mettre à jour un hôtel
    @PutMapping("/{id}")
    public ResponseEntity<Hotel> updateHotel(
            @PathVariable Long id,
            @RequestBody Hotel hotel) {
        try {
            Hotel updatedHotel = hotelService.updateHotel(id, hotel);
            return ResponseEntity.ok(updatedHotel);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // DELETE /api/hotels/{id} - Supprimer un hôtel
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteHotel(@PathVariable Long id) {
        hotelService.deleteHotel(id);
        return ResponseEntity.noContent().build();
    }
}