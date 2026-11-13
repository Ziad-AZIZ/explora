package com.explora.notifications.controller;

import com.explora.notifications.dto.ApiResponse;
import com.explora.notifications.dto.ProximityCheckRequest;
import com.explora.notifications.entity.PointOfInterest;
import com.explora.notifications.repository.PointOfInterestRepository;
import com.explora.notifications.service.ProximityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proximity")
public class ProximityController {

    @Autowired
    private ProximityService proximityService;

    @Autowired
    private PointOfInterestRepository poiRepo;

    // POST /api/proximity/check
    @PostMapping("/check")
    public ResponseEntity<Map<String, Object>> checkProximity(@RequestBody ProximityCheckRequest request) {
        List<String> triggered = proximityService.checkProximity(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "notificationsTriggered", triggered.size(),
                "details", triggered
        ));
    }

    // POST /api/proximity/poi → ajouter un POI manuellement
    @PostMapping("/poi")
    public ResponseEntity<PointOfInterest> addPoi(@RequestBody PointOfInterest poi) {
        return ResponseEntity.ok(poiRepo.save(poi));
    }

    // GET /api/proximity/poi → lister tous les POIs
    @GetMapping("/poi")
    public ResponseEntity<List<PointOfInterest>> getAllPois() {
        return ResponseEntity.ok(poiRepo.findAll());
    }

    // GET /api/proximity/poi/city/{city}
    @GetMapping("/poi/city/{city}")
    public ResponseEntity<List<PointOfInterest>> getByCity(@PathVariable String city) {
        return ResponseEntity.ok(poiRepo.findByCity(city));
    }
}