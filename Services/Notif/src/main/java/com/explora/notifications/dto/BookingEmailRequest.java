package com.explora.notifications.dto;

import lombok.Data;

@Data
public class BookingEmailRequest {
    private String email;
    private String userName;
    private String hotelName;
    private String checkInDate;
    private String checkOutDate;
    private String bookingId;
}