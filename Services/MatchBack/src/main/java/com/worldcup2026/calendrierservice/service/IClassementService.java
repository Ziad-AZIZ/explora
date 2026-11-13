package com.worldcup2026.calendrierservice.service;
import com.worldcup2026.calendrierservice.dto.ClassementDTO;
import com.worldcup2026.calendrierservice.dto.GroupeClassementDTO;
import java.util.List;
public interface IClassementService {
    List<GroupeClassementDTO> findAllGroupedByGroupe();
    List<ClassementDTO> findByGroupe(String nomGroupe);
}
