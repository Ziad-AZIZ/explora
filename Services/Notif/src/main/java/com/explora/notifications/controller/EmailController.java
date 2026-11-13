package com.explora.notifications.controller;

import com.explora.notifications.dto.ApiResponse;
import com.explora.notifications.dto.BookingEmailRequest;
import com.explora.notifications.dto.PasswordResetEmailRequest;
import com.explora.notifications.dto.WelcomeEmailRequest;
import com.explora.notifications.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    @Autowired
    private EmailService emailService;

    // POST /api/emails/welcome
    @PostMapping("/welcome")
    public ResponseEntity<ApiResponse> sendWelcomeEmail(@RequestBody WelcomeEmailRequest request) {
        boolean sent = emailService.sendWelcomeEmail(request.getEmail(), request.getUserName());
        if (sent) {
            return ResponseEntity.ok(new ApiResponse(true, "Email de bienvenue envoyé à " + request.getEmail()));
        }
        return ResponseEntity.badRequest().body(new ApiResponse(false, "Échec de l'envoi"));
    }

    // POST /api/emails/password-reset
    @PostMapping("/password-reset")
    public ResponseEntity<ApiResponse> sendPasswordResetEmail(@RequestBody PasswordResetEmailRequest request) {
        boolean sent = emailService.sendPasswordResetEmail(
                request.getEmail(),
                request.getUserName(),
                request.getResetLink()
        );
        if (sent) {
            return ResponseEntity.ok(new ApiResponse(true, "Email de reset envoyé à " + request.getEmail()));
        }
        return ResponseEntity.badRequest().body(new ApiResponse(false, "Échec de l'envoi"));
    }

    // POST /api/emails/booking-confirmation
    @PostMapping("/booking-confirmation")
    public ResponseEntity<ApiResponse> sendBookingConfirmation(@RequestBody BookingEmailRequest request) {
        boolean sent = emailService.sendBookingConfirmationEmail(
                request.getEmail(),
                request.getUserName(),
                request.getHotelName(),
                request.getCheckInDate(),
                request.getCheckOutDate(),
                request.getBookingId()
        );
        if (sent) {
            return ResponseEntity.ok(new ApiResponse(true, "Email de confirmation envoyé"));
        }
        return ResponseEntity.badRequest().body(new ApiResponse(false, "Échec de l'envoi"));
    }
}