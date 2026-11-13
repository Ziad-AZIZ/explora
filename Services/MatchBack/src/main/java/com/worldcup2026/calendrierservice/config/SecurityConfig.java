package com.worldcup2026.calendrierservice.config;

import com.worldcup2026.calendrierservice.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CONFIGURATION SECURITE — Service MatchBack (Calendrier CDM 2026)
 * ================================================================
 * - GET /api/wc2026/matchs/**        → public
 * - GET /api/wc2026/equipes/**       → public
 * - GET /api/wc2026/classements/**   → public
 * - GET /api/wc2026/predictions/**   → public
 * - /api/wc2026/admin/**             → JWT obligatoire
 */
@Configuration
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    /** Origines CORS lues depuis la variable d'env FRONTEND_ORIGINS. */
    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOriginPatterns(List.of("*"));
        cors.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cors.setAllowedHeaders(List.of("*"));
        cors.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public — World Cup data (read-only)
                        .requestMatchers("/api/wc2026/matchs/**").permitAll()
                        .requestMatchers("/api/wc2026/equipes/**").permitAll()
                        .requestMatchers("/api/wc2026/classements/**").permitAll()
                        .requestMatchers("/api/wc2026/predictions/**").permitAll()
                        // Protected — Admin endpoints
                        .requestMatchers("/api/wc2026/admin/**").authenticated()
                        // Default — block everything else
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}
