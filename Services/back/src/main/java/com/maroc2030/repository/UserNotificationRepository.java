package com.maroc2030.repository;

import com.maroc2030.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserId(Long userId);
    List<UserNotification> findByUserIdOrderByReceivedAtDesc(Long userId);
    List<UserNotification> findByUserIdAndIsRead(Long userId, Boolean isRead);
    Optional<UserNotification> findByUserIdAndNotificationId(Long userId, Long notificationId);
    Long countByUserIdAndIsRead(Long userId, Boolean isRead);
}