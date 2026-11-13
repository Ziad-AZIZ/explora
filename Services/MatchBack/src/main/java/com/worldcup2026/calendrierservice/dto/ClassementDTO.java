package com.worldcup2026.calendrierservice.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ClassementDTO {
    private Integer position;
    private Long equipeId;
    private String equipeNom;
    private String equipeLogo;
    private Integer matchsJoues;
    private Integer victoires;
    private Integer nuls;
    private Integer defaites;
    private Integer butsPour;
    private Integer butsContre;
    private Integer difference;
    private Integer points;
}
