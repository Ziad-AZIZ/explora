package com.worldcup2026.calendrierservice.service;
import com.worldcup2026.calendrierservice.dto.EquipeDTO;
import com.worldcup2026.calendrierservice.dto.EquipeDetailDTO;
import java.util.List;
public interface IEquipeService {
    List<EquipeDTO> findAll();
    EquipeDetailDTO findDetailById(Long id);
}
