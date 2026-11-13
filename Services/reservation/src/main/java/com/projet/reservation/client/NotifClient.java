package com.projet.reservation.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "notif-service", url = "http://notif:8084", configuration = com.projet.reservation.config.FeignConfig.class)
public interface NotifClient {

    @PostMapping("/api/notifications/send-confirmation")
    String sendConfirmation(@RequestBody java.util.Map<String, Object> payload);
}
