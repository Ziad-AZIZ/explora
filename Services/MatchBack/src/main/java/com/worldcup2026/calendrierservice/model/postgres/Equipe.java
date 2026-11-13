package com.worldcup2026.calendrierservice.model.postgres;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/**
 * Une equipe participant a la CDM 2026.
 * Stockee en PostgreSQL car les 48 equipes sont fixes pendant tout le tournoi.
 */
@Entity
@Table(name = "equipe")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Equipe {

    /** ID officiel d'API-Football (utile pour les appels directs) */
    @Id
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(length = 5)
    private String code;

    /** URL du logo/drapeau fourni par API-Football */
    @Column(length = 500)
    private String logo;

    /** UEFA, CAF, CONMEBOL, CONCACAF, AFC, OFC */
    @Column(length = 20)
    private String confederation;

    /** Classement FIFA (optionnel, peut etre rempli si on le recupere) */
    private Integer classementFifa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groupe_id")
    @JsonIgnore  // evite la boucle infinie de serialisation JSON
    private Groupe groupe;

    /** Pour le front, on veut quand meme voir le nom du groupe */
    @Transient
    public String getGroupeNom() {
        return groupe != null ? groupe.getNom() : null;
    }
}
