  package com.pfa.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Classe principale de l'application Spring Boot.
 * C'est le point d'entree (equivalent du "main" en Java classique).
 *
 * L'annotation @SpringBootApplication active :
 *   - La configuration automatique de Spring
 *   - Le scan des composants (@Controller, @Service, @Repository...)
 *   - Le serveur web embarque (Tomcat)
 */
@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthApplication.class, args);
        System.out.println("Backend Spring Boot demarre sur http://localhost:8080");
    }
}
