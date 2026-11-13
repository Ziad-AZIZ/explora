package com.worldcup2026.calendrierservice.service.sync;

/**
 * Contrat commun a tous les services de synchronisation (equipes, classements,
 * matchs). Chaque implementation est responsable d'un SEUL domaine (SRP).
 *
 * SOLID :
 *  - ISP : interface minimale, une seule methode.
 *  - LSP : toute implementation peut remplacer ce contrat sans casser l'orchestrateur.
 *  - OCP : on peut ajouter un nouveau domaine (ex: StadeSyncService) sans modifier
 *          l'existant, il suffit de le faire implementer cette interface.
 */
public interface ISyncService {

    /**
     * Execute la synchronisation du domaine pris en charge par cette implementation.
     * L'implementation doit etre idempotente (appelable plusieurs fois sans effet
     * secondaire indesirable) et ne doit pas lever d'exception vers l'appelant :
     * les erreurs doivent etre logguees et gerees en interne.
     */
    void synchroniser();

    /**
     * Libelle court du domaine synchronise (ex: "equipes", "classements", "matchs").
     * Utilise uniquement pour les logs de l'orchestrateur.
     */
    String domaine();
}
