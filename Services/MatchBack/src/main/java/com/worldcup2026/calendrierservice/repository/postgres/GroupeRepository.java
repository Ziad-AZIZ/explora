package com.worldcup2026.calendrierservice.repository.postgres;

import com.worldcup2026.calendrierservice.model.postgres.Groupe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupeRepository extends JpaRepository<Groupe, Long> {

    Optional<Groupe> findByNom(String nom);
}
