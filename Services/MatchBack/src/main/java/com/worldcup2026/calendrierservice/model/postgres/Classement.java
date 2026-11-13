package com.worldcup2026.calendrierservice.model.postgres;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Position d'une equipe dans son groupe a un instant T.
 * Mis a jour periodiquement depuis API-Football.
 * Stocke en Postgres pour garder un historique propre des classements.
 */
@Entity
@Table(name = "classement",
       uniqueConstraints = @UniqueConstraint(columnNames = {"equipe_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Classement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipe_id", nullable = false)
    private Equipe equipe;

    /** Position dans le groupe (1 a 4) */
    private Integer position;

    private Integer matchsJoues;
    private Integer victoires;
    private Integer nuls;
    private Integer defaites;

    private Integer butsPour;
    private Integer butsContre;
    private Integer difference;

    private Integer points;

    private LocalDateTime derniereMiseAJour;
}
