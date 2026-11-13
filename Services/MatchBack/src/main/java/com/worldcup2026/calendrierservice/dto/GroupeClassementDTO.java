package com.worldcup2026.calendrierservice.dto;
import lombok.*;
import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GroupeClassementDTO {
    private String nom;
    private List<ClassementDTO> classements;
}
