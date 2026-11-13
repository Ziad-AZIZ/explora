# Refactor MVC + SOLID — Étape 1

## Architecture cible

```
controller/        ← HTTP pur, dépend d'INTERFACES
service/
  ├─ I*Service.java       ← interfaces (DIP)
  ├─ *ServiceImpl.java    ← implémentations
  └─ api/IExternalApiClient.java  ← abstraction du fournisseur API
dto/               ← objets de transport typés (remplace Map<String,Object>)
mapper/            ← Entity ↔ DTO (SRP isolé)
exception/         ← GlobalExceptionHandler + exceptions métier
model/             ← inchangé (entités JPA / Mongo)
repository/        ← inchangé
```

## Principes SOLID appliqués

| Principe | Avant | Après |
|---|---|---|
| **S**RP | Controllers faisaient HTTP + mapping + logique | Controllers = HTTP / Services = logique / Mappers = conversion |
| **O**CP | `Wc2026ApiService` couplé partout | `IExternalApiClient` : on ajoute un fournisseur sans modifier le reste |
| **L**SP | N/A | Tout impl peut remplacer son interface (contrats stables via DTOs) |
| **I**SP | N/A | Interfaces ciblées par domaine (IEquipe, IMatch, IClassement) |
| **D**IP | Controllers → classes concrètes | Controllers → interfaces uniquement |

## Principes MVC appliqués

- **Model** : entités (`Equipe`, `MatchLive`, `Classement`) + DTOs
- **View** : sérialisation JSON automatique des DTOs (pas de logique de présentation dans les controllers)
- **Controller** : reçoit la requête HTTP, délègue 100% au service, retourne le DTO

## Fichiers créés

- `dto/` : EquipeDTO, EquipeDetailDTO, ClassementDTO, GroupeClassementDTO, StatsEquipeDTO
- `mapper/` : EquipeMapper, ClassementMapper
- `exception/` : ResourceNotFoundException, BusinessException, GlobalExceptionHandler
- `service/` : IEquipeService + Impl, IMatchService + Impl, IClassementService + Impl
- `service/api/IExternalApiClient` (Wc2026ApiService implémente désormais cette interface)

## Fichiers modifiés

- `controller/EquipeController` — passé de 130 → 30 lignes (logique migrée vers service)
- `controller/MatchController` — passé de 60 → 30 lignes
- `controller/ClassementController` — passé de 65 → 25 lignes
- `service/Wc2026ApiService` — implémente désormais `IExternalApiClient`

## Réponses HTTP : avant / après

**Avant** : `Map<String, Object>` non typé → impossible à valider, pas d'auto-complétion côté front.
**Après** : DTOs typés → contrat d'API clair, validation possible, doc OpenAPI auto.

## Étape suivante (à ta demande)

Module Réservation : entité `Reservation` + service + controller + génération QR code + frontend (modal de réservation + redirection FIFA).
