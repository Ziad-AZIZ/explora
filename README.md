# EXPLORA — Compagnon mobile pour la Coupe du Monde 2030 au Maroc

Application mobile multiservices destinée aux supporters pendant la Coupe du Monde 2030 : calendrier des matchs en temps réel, hôtels et restaurants, réservations, notifications, carte interactive et assistant conversationnel.

Projet de fin d'année (PFA) — 4ᵉ année Génie Informatique, EHEIM Oujda, 2025-2026.

## Architecture

```
                    ┌──────────────────────┐
                    │  App mobile (Expo /  │
                    │   React Native)      │
                    └──────────┬───────────┘
                               │ HTTP (JWT)
                    ┌──────────▼───────────┐
                    │   API Gateway :8000  │  Spring Cloud Gateway
                    └──┬────┬────┬────┬──┬─┘
          ┌────────────┘    │    │    │  └─────────────┐
   ┌──────▼─────┐ ┌─────────▼─┐ ┌▼────────┐ ┌─────────▼──┐ ┌──────────▼───┐
   │ Auth :8086 │ │Catalogue  │ │Réserva- │ │Calendrier  │ │Notifications │
   │ Spring Boot│ │  :5000    │ │tion     │ │CDM :8085   │ │   :8084      │
   │   MySQL    │ │Spring Boot│ │ :8080   │ │Spring Boot │ │ Spring Boot  │
   └────────────┘ │   MySQL   │ │  MySQL  │ │Postgres +  │ │ MySQL + FCM  │
                  └───────────┘ └─────────┘ │  MongoDB   │ └──────────────┘
                                            └────────────┘
                    ┌──────────────────────┐
                    │  Chatbot :5001       │  FastAPI + Groq (LLM) + scikit-learn
                    └──────────────────────┘
```

| Service | Dossier | Stack | Rôle |
|---|---|---|---|
| Gateway | `Services/gateway` | Spring Cloud Gateway, Java 17 | Point d'entrée unique, routage, CORS |
| Auth | `Services/Auth` | Spring Boot 3, Spring Security, JWT, BCrypt, MySQL | Inscription, connexion, profil |
| Catalogue | `Services/back` | Spring Boot 3, JPA, MySQL, Swagger | Hôtels, restaurants, favoris, recherche |
| Réservation | `Services/reservation` | Spring Boot 3, Java 21, MySQL | Réservations hôtels / restaurants |
| Calendrier CDM | `Services/MatchBack` | Spring Boot 3, Java 21, PostgreSQL, MongoDB | Matchs, équipes, classements, cache API temps réel |
| Notifications | `Services/Notif` | Spring Boot 3, Firebase FCM, SMTP, Thymeleaf | Push, e-mails transactionnels, rappels de matchs |
| Chatbot | `Services/chatbot` | Python, FastAPI, Groq, pandas, scikit-learn | Recherche d'hôtels en langage naturel, planification |
| Mobile | `front` | Expo SDK 54, React Native 0.81, React Navigation, i18next | Application utilisateur (FR / EN / AR / ES) |

Chaque service est conteneurisé (Dockerfile multi-stage) et orchestré par `docker-compose.yml`.

## Démarrage rapide

Prérequis : Docker Desktop, Node 20+, un appareil ou émulateur avec Expo Go.

```bash
# 1. Backend
cp .env.example .env            # puis renseigner JWT_SECRET, GROQ_API_KEY, WC2026_API_KEY
docker compose up --build       # gateway sur http://localhost:8000

# 2. Application mobile
cd front
cp .env.example .env            # EXPO_PUBLIC_GATEWAY_URL = IP de la machine qui héberge le backend
npm install
npx expo start
```

Swagger du catalogue : `http://localhost:5000/swagger-ui.html` · Notifications : `http://localhost:8084/swagger-ui.html`

## Principaux endpoints (via la gateway)

| Domaine | Endpoints |
|---|---|
| Auth | `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/users/me` |
| Catalogue | `GET /api/hotels`, `GET /api/restaurants`, `GET /api/search?q=`, `POST /api/favorites/toggle` |
| Réservation | `GET/POST /api/reservations`, `PUT /api/reservations/{id}/status` |
| Calendrier | `GET /api/wc2026/matchs`, `/matchs/live`, `/equipes/{id}`, `/classements/{groupe}` |
| Notifications | `POST /api/notifications/send`, `POST /api/emails/welcome`, `POST /api/scheduling/match-reminder` |
| Chatbot | `POST /chat` (service direct, port 5001) |

## Organisation du dépôt

```
explora/
├── docker-compose.yml      # orchestration complète
├── .env.example            # variables d'environnement attendues
├── Services/               # un dossier par microservice
│   ├── gateway/
│   ├── Auth/
│   ├── back/               # catalogue
│   ├── reservation/
│   ├── MatchBack/          # calendrier CDM 2026
│   ├── Notif/
│   └── chatbot/
└── front/                  # application mobile Expo
```

## Workflow Git

- `main` : versions stables, taguées (`v1.0.0`)
- `develop` : branche d'intégration
- `feature/<service>` : une branche par service, fusionnée dans `develop` via merge commit (`--no-ff`)

## Équipe

Projet réalisé en équipe. Dépôt d'origine sur GitLab ; ce dépôt est une republication nettoyée (secrets retirés, historique réorganisé).

| Membre | Contribution principale |
|---|---|
| Mohamed Ziad AZIZ ([@Ziad-AZIZ](https://github.com/Ziad-AZIZ)) | Service Calendrier CDM (`MatchBack`) : Spring Boot, PostgreSQL + MongoDB, client API temps réel avec cache, dockerisation |
| Lotfi Bouzidi | Service Auth (Spring Security, JWT, BCrypt) |
| Mohammed Kasmi | API Gateway, intégration JWT inter-services, clients Feign |
| Mohammed Eddahmani | Chatbot et service Réservation |
| Doha | Application mobile, intégration Docker globale |
| Walid | Service Notifications |

## Sécurité

Aucun secret n'est versionné : clés API, mots de passe et secret JWT passent par `.env` (voir `.env.example`). Le fichier `firebase-service-account.json` du service Notifications est à fournir localement.
