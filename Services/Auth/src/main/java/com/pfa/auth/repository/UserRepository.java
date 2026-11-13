package com.pfa.auth.repository;

import com.pfa.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * REPOSITORY - Acces a la table "users"
 * =====================================
 * Spring Data JPA genere automatiquement le code SQL pour les methodes
 * dont le nom suit une convention (findByEmail, existsByUsername...).
 *
 * Aucune implementation manuelle n'est necessaire : il suffit de declarer
 * l'interface et Spring fournit l'implementation au runtime.
 *
 * JpaRepository<User, Long> = entite User dont la cle primaire est Long.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // SELECT * FROM users WHERE username = ?
    Optional<User> findByUsername(String username);

    // SELECT * FROM users WHERE email = ? OR username = ?
    Optional<User> findByEmailOrUsername(String email, String username);

    // SELECT COUNT(*) > 0 FROM users WHERE email = ?
    boolean existsByEmail(String email);

    // SELECT COUNT(*) > 0 FROM users WHERE username = ?
    boolean existsByUsername(String username);
}
