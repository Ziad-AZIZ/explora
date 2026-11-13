package com.pfa.auth.service;

import com.pfa.auth.dto.AuthResponse;
import com.pfa.auth.dto.LoginRequest;
import com.pfa.auth.dto.SignupRequest;
import com.pfa.auth.model.User;
import com.pfa.auth.repository.UserRepository;
import com.pfa.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * SERVICE - Authentification (SRP)
 * ================================
 * SEULE responsabilite : gerer l'inscription et la connexion.
 * Aucune logique de profil, aucune logique d'admin.
 */
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Injection de dependances par constructeur (bonne pratique Spring)
    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    /**
     * Inscription d'un nouvel utilisateur.
     * - Verifie l'unicite de l'email et du username
     * - Hash le mot de passe avec BCrypt
     * - Sauvegarde en base
     * - Genere un JWT et le retourne
     */
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Cet email est deja utilise");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Ce username est deja pris");
        }

        User user = new User();
        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        // BCrypt : hashage securise avec salt automatique
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);
        return new AuthResponse(token);
    }

    /**
     * Connexion d'un utilisateur existant.
     * - Recherche par email OU username
     * - Verifie le mot de passe avec BCrypt
     * - Genere un JWT et le retourne
     */
    public AuthResponse login(LoginRequest request) {
        User user = userRepository
                .findByEmailOrUsername(request.getEmailOrUsername(), request.getEmailOrUsername())
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur non trouve"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Mot de passe incorrect");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }
}
