package com.maroc2030.repository;

import com.maroc2030.model.Favorite;
import com.maroc2030.model.FavoriteType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
    List<Favorite> findByUserId(Long userId);
    List<Favorite> findByUserIdAndType(Long userId, FavoriteType type);
    Optional<Favorite> findByUserIdAndItemIdAndType(Long userId, Long itemId, FavoriteType type);
    boolean existsByUserIdAndItemIdAndType(Long userId, Long itemId, FavoriteType type);
    void deleteByUserIdAndItemIdAndType(Long userId, Long itemId, FavoriteType type);
}