package com.worldcup2026.calendrierservice.repository.postgres;

import com.worldcup2026.calendrierservice.model.postgres.Classement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClassementRepository extends JpaRepository<Classement, Long> {

    Optional<Classement> findByEquipe_Id(Long equipeId);

    List<Classement> findByEquipe_Groupe_NomOrderByPositionAsc(String nomGroupe);
}
