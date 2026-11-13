package com.worldcup2026.calendrierservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configuration Web.
 *
 * NOTE : CORS est maintenant gere par SecurityConfig (via Spring Security).
 * Cette classe reste pour d'eventuelles extensions MVC futures,
 * mais la configuration CORS a ete retiree pour eviter les conflits
 * avec le SecurityFilterChain.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    // CORS is now managed by SecurityConfig.corsConfigurationSource()
}
