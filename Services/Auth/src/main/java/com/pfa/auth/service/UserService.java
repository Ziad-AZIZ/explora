package com.pfa.auth.service;

import com.pfa.auth.dto.UpdateProfileRequest;
import com.pfa.auth.dto.UserResponse;
import com.pfa.auth.model.User;
import com.pfa.auth.repository.UserRepository;
import org.springframework.stereotype.Service;

/**
 * SERVICE - Gestion du profil utilisateur (SRP)
 * =============================================
 * SEULE responsabilite : modifier les informations du profil
 * (nom et photo). Aucune logique d'authentification ici.
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Met a jour le nom et la photo d'un utilisateur identifie par son id.
     */
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        user.setName(request.getName());

        // On ne change la photo que si une nouvelle a ete envoyee
        if (request.getProfilePic() != null && !request.getProfilePic().isBlank()) {
            user.setProfilePic(request.getProfilePic());
        }

        User updated = userRepository.save(user);
        return UserResponse.from(updated);
    }

    /**
     * Met a jour le mot de passe de l'utilisateur.
     */
    public void updatePassword(Long userId, String currentPassword, String newPassword, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mot de passe actuel incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Recupere un utilisateur par son id (utile pour rafraichir le profil).
     */
    public UserResponse getById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Utilisateur introuvable"));
        return UserResponse.from(user);
    }
}
