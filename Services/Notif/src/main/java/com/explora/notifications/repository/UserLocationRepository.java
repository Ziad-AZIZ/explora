package com.explora.notifications.repository;

import com.explora.notifications.entity.UserLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserLocationRepository extends JpaRepository<UserLocation, Long> {
    Optional<UserLocation> findByUserId(Long userId);
    List<UserLocation> findByCity(String city);
}