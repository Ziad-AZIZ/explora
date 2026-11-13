package com.explora.notifications.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.io.InputStream;

@Component
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // Charger le fichier firebase-service-account.json depuis resources/
            InputStream serviceAccount = getClass()
                    .getClassLoader()
                    .getResourceAsStream("firebase-service-account.json");

            if (serviceAccount == null) {
                throw new RuntimeException("Fichier firebase-service-account.json introuvable !");
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            // Éviter la double initialisation
            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase initialisé avec succès !");
            }

        } catch (Exception e) {
            System.err.println("❌ Erreur d'initialisation Firebase : " + e.getMessage());
            e.printStackTrace();
        }
    }
}