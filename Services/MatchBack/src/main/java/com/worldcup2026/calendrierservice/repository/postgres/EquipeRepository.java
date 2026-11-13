package com.worldcup2026.calendrierservice.repository.postgres;

import com.worldcup2026.calendrierservice.model.postgres.Equipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EquipeRepository extends JpaRepository<Equipe, Long> {

    /**
     * Renvoie la premiere equipe trouvee pour un code donne (tolerant aux doublons
     * qui peuvent exister en BDD suite a des runs de sync avec des donnees incoherentes).
     */
    Optional<Equipe> findFirstByCodeOrderByIdAsc(String code);

    /** Utile pour detecter et nettoyer les doublons de code. */
    List<Equipe> findAllByCode(String code);

    Optional<Equipe> findByNom(String nom);

    List<Equipe> findByConfederation(String confederation);

    List<Equipe> findByGroupe_Nom(String nomGroupe);
}
