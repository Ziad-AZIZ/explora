package com.worldcup2026.calendrierservice.dto;
import lombok.*;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EquipeDTO {
    private Long id;
    private String nom;
    private String code;
    private String logo;
    private String confederation;
    private Integer classementFifa;
    private String groupe;
}
