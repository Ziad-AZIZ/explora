package com.worldcup2026.calendrierservice.service.api;
/**
 * Abstraction du client API externe (WC2026, API-Football, mock pour tests...).
 * DIP : SynchronisationService dépend de cette interface, pas d'une implémentation.
 * OCP : pour ajouter un nouveau fournisseur, créer une nouvelle impl sans modifier l'existant.
 */
public interface IExternalApiClient {
    String getTeams();
    String getStandings();
    String getStandingsByGroup(String group);
    String getMatches();
    String getMatchesLive();
    String getMatchesByTeam(String teamCode);
    String getMatchesByGroup(String group);
    String getMatchesByRound(String round);
}
