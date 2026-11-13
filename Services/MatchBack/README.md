# Backend Calendrier CDM 2026

Backend Spring Boot pour le projet Coupe du Monde 2026, avec une architecture **polyglot persistence** :

- **PostgreSQL** — données stables : équipes, groupes, classements
- **MongoDB** — données volatiles : matchs live, événements, cache API
- **API-Football** — source temps réel (plan gratuit, 100 requêtes/jour)

## Architecture

```
Frontend React
     |
     v
Backend Spring Boot (port 8081)
     |
     +--> PostgreSQL (worldcup2026)   -- equipes, groupes, classements
     |
     +--> MongoDB (worldcup2026_live) -- matchs, evenements, cache API
     |
     +--> API-Football (externe)      -- source temps reel
```

Le backend sert de **proxy + cache** entre le frontend et API-Football. Grâce au cache MongoDB (30s pour live, 1h sinon), on reste largement sous les 100 requêtes/jour du plan gratuit même avec de nombreux utilisateurs.

## Prérequis

1. **Java 21**
2. **PostgreSQL** (port 5432) avec une base `worldcup2026` créée :
   ```sql
   CREATE DATABASE worldcup2026;
   ```
3. **MongoDB** (port 27017) — pas besoin de créer la base, Spring s'en occupe
4. **Clé API-Football** — inscription gratuite sur https://dashboard.api-football.com/register

## Configuration

Éditer `src/main/resources/application.properties` :

```properties
# Adapter si ton user/password Postgres est different
spring.datasource.username=postgres
spring.datasource.password=postgres

# !!! Mettre ta vraie cle API-Football ici !!!
apifootball.key=TA_VRAIE_CLE_ICI
```

## Démarrage

```bash
./mvnw spring-boot:run
```

Au démarrage, le scheduler déclenche une synchronisation avec API-Football :
1. Récupère les classements (`/standings`) → remplit les groupes, équipes et classements dans PostgreSQL
2. Récupère les matchs (`/fixtures`) → remplit la collection `match_live` dans MongoDB
3. Répète toutes les 5 minutes (mais utilise le cache, donc peu d'appels réels)

## Endpoints exposés

### Équipes
- `GET /api/wc2026/equipes` — liste des 48 équipes
- `GET /api/wc2026/equipes/{id}` — détail d'une équipe (infos + classement groupe + matchs + stats)

### Matchs
- `GET /api/wc2026/matchs` — calendrier complet trié par date
- `GET /api/wc2026/matchs/phase/{phase}` — filtrer par phase
- `GET /api/wc2026/matchs/live` — uniquement les matchs en cours

### Classements
- `GET /api/wc2026/classements` — tous les groupes avec classements
- `GET /api/wc2026/classements/{nomGroupe}` — classement d'un groupe (ex: `A`)

## Structure du projet

```
src/main/java/com/worldcup2026/calendrierservice/
├── CalendrierServiceApplication.java
├── config/
│   ├── PostgresConfig.java          -- scan repos JPA
│   ├── MongoConfig.java             -- scan repos Mongo
│   └── RestTemplateConfig.java      -- bean HTTP client
├── model/
│   ├── postgres/                    -- entites JPA
│   │   ├── Equipe.java
│   │   ├── Groupe.java
│   │   └── Classement.java
│   └── mongo/                       -- documents Mongo
│       ├── ApiCache.java
│       └── MatchLive.java
├── repository/
│   ├── postgres/                    -- JpaRepository
│   └── mongo/                       -- MongoRepository
├── service/
│   ├── ApiFootballService.java      -- client API-Football avec cache
│   ├── SynchronisationService.java  -- parse JSON et remplit les bases
│   └── SyncScheduler.java           -- declenche la sync periodiquement
└── controller/
    ├── EquipeController.java
    ├── MatchController.java
    └── ClassementController.java
```

## Passer en production

1. Changer `spring.jpa.hibernate.ddl-auto=update` en `validate`
2. Lancer `schema.sql` à la main sur PostgreSQL
3. Mettre la clé API-Football dans une variable d'environnement au lieu du fichier
```
