package com.explora.notifications.config;

import com.explora.notifications.entity.PointOfInterest;
import com.explora.notifications.repository.PointOfInterestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class PoiSeeder implements CommandLineRunner {

    @Autowired
    private PointOfInterestRepository poiRepo;

    @Override
    public void run(String... args) {
        if (poiRepo.count() > 0) {
            System.out.println("ℹ️ POIs déjà présents, skip seeding");
            return;
        }

        System.out.println("🌱 Insertion des points d'intérêt...");

        // ===== FÈS =====
        save("Médersa Bou Inania", "Joyau du 14ème siècle, chef-d'œuvre de l'art mérinide",
                34.0639, -4.9772, "Fès", "monument");
        save("Université Al Quaraouiyine", "Plus ancienne université du monde encore en activité (859)",
                34.0648, -4.9735, "Fès", "monument");
        save("Place R'cif", "Place historique de la médina de Fès",
                34.0625, -4.9719, "Fès", "place");

        // ===== MARRAKECH =====
        save("Mosquée Koutoubia", "Mosquée emblématique de Marrakech, minaret de 77m",
                31.6242, -7.9933, "Marrakech", "monument");
        save("Place Jemaa el-Fna", "Place mythique inscrite au patrimoine UNESCO",
                31.6258, -7.9890, "Marrakech", "place");
        save("Palais Bahia", "Palais du 19ème siècle aux jardins somptueux",
                31.6213, -7.9831, "Marrakech", "monument");

        // ===== CASABLANCA =====
        save("Mosquée Hassan II", "3ème plus grande mosquée du monde, sur l'océan",
                33.6086, -7.6326, "Casablanca", "monument");
        save("Grand Stade de Casablanca", "Stade des matchs de la CAN et du Mondial 2030",
                33.5650, -7.6720, "Casablanca", "stadium");

        // ===== RABAT =====
        save("Tour Hassan", "Minaret inachevé du 12ème siècle",
                34.0240, -6.8222, "Rabat", "monument");
        save("Kasbah des Oudayas", "Forteresse historique surplombant l'océan",
                34.0312, -6.8364, "Rabat", "monument");

        // ===== CHEFCHAOUEN =====
        save("Place Outa el Hammam", "Place principale de la ville bleue",
                35.1688, -5.2636, "Chefchaouen", "place");

        System.out.println("✅ " + poiRepo.count() + " POIs insérés");
    }

    private void save(String name, String desc, double lat, double lon, String city, String category) {
        PointOfInterest poi = new PointOfInterest();
        poi.setName(name);
        poi.setDescription(desc);
        poi.setLatitude(lat);
        poi.setLongitude(lon);
        poi.setCity(city);
        poi.setCategory(category);
        poiRepo.save(poi);
    }
}