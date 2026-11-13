package com.worldcup2026.calendrierservice.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StatsEquipeDTO {
    private Integer matchsJoues, victoires, nuls, defaites;
    private Integer butsPour, butsContre, difference, points;
}
