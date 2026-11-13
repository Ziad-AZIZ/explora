package com.worldcup2026.calendrierservice.model.postgres;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Un groupe de la phase de poules de la CDM 2026 (A, B, C, ..., L).
 * Stocke en PostgreSQL car c'est une donnee stable du tournoi.
 */
@Entity
@Table(name = "groupe")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Groupe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** "A", "B", "C", ... "L" */
    @Column(unique = true, nullable = false, length = 2)
    private String nom;

    /** Les equipes du groupe (4 equipes par groupe en CDM 2026) */
    @OneToMany(mappedBy = "groupe", fetch = FetchType.LAZY)
    private List<Equipe> equipes = new ArrayList<>();
}
