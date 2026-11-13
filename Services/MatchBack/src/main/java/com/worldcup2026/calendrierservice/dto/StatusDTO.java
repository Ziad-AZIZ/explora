package com.worldcup2026.calendrierservice.dto;

import lombok.*;
import java.time.Instant;

/**
 * DTO renvoyé par GET /api/wc2026/admin/status.
 * Fournit l'état courant des deux bases de données.
 */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatusDTO {
    private long nbEquipes;
    private long nbGroupes;
    private long nbMatchs;
    private long nbClassements;
    private Instant derniereSynchro;
    private String message;
}
