package com.explora.notifications.controller;

import com.explora.notifications.dto.ApiResponse;
import com.explora.notifications.dto.ScheduleMatchReminderRequest;
import com.explora.notifications.entity.ScheduledNotification;
import com.explora.notifications.repository.ScheduledNotificationRepository;
import com.explora.notifications.service.SchedulingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/scheduling")
public class SchedulingController {

    @Autowired
    private SchedulingService schedulingService;

    @Autowired
    private ScheduledNotificationRepository scheduledRepo;

    // POST /api/scheduling/match-reminder
    @PostMapping("/match-reminder")
    public ResponseEntity<ApiResponse> scheduleMatchReminder(@RequestBody ScheduleMatchReminderRequest request) {
        try {
            List<ScheduledNotification> created = schedulingService.scheduleMatchReminders(request);
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    created.size() + " rappels planifiés pour " + request.getMatchName()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, "Erreur : " + e.getMessage()));
        }
    }

    // GET /api/scheduling/user/{userId} → voir toutes les notifs planifiées d'un user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ScheduledNotification>> getUserScheduledNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(scheduledRepo.findByUserIdOrderByScheduledForAsc(userId));
    }

    // GET /api/scheduling/all → voir TOUTES les notifs planifiées (debug)
    @GetMapping("/all")
    public ResponseEntity<List<ScheduledNotification>> getAll() {
        return ResponseEntity.ok(scheduledRepo.findAll());
    }
}