# 🔔 Microservice Notifications — Explora Maroc

Microservice Spring Boot qui gère :
- 📱 Notifications push (Firebase Cloud Messaging)
- 📧 Emails transactionnels (Gmail SMTP)
- 🏟️ Rappels de matchs planifiés
- 📍 Notifications de proximité GPS
- 🌤️ Alertes météo automatiques
- 🎉 Notifications de fan zones
- 🌍 Système multilingue (FR / EN / AR / ES)

## 🛠️ Stack technique

- Java 17+
- Spring Boot 3.x
- MySQL 8
- Firebase Admin SDK
- Thymeleaf (templates emails)
- OpenWeatherMap API

## 🚀 Démarrage rapide

### Prérequis
- Java 17 ou plus
- Maven 3.8+
- MySQL 8 en local
- Compte Firebase avec le fichier `firebase-service-account.json`
- Compte Gmail avec mot de passe d'application
- Clé OpenWeatherMap API

### Installation

```bash
git clone <url-du-repo>
cd notifications-service
```

### Configuration

1. Crée la BDD MySQL :
```sql
CREATE DATABASE explora_notifications CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Mets ton fichier `firebase-service-account.json` dans `src/main/resources/`

3. Configure `src/main/resources/application.properties` (voir `application.properties.example`)

4. Lance l'appli :
```bash
mvn spring-boot:run
```

Le service démarre sur **http://localhost:8084**.

## 📚 Documentation API

Une fois l'appli lancée, accède à Swagger :
**http://localhost:8084/swagger-ui.html**

## 🧪 Tests

Importe la collection Postman fournie : `postman/Explora-Notifications.postman_collection.json`

## 📌 Endpoints principaux

| Méthode | URL | Description |
|---|---|---|
| POST | `/api/notifications/register-token` | Enregistrer le token FCM d'un device |
| POST | `/api/notifications/send` | Envoyer une notif push |
| POST | `/api/notifications/send-templated` | Envoyer une notif via template multilingue |
| GET | `/api/notifications/user/{userId}` | Historique notifs d'un user |
| GET | `/api/notifications/user/{userId}/unread` | Notifs non lues |
| POST | `/api/emails/welcome` | Email de bienvenue |
| POST | `/api/emails/password-reset` | Email reset password |
| POST | `/api/emails/booking-confirmation` | Email confirmation réservation |
| POST | `/api/scheduling/match-reminder` | Planifier 3 rappels pour un match |
| POST | `/api/proximity/check` | Vérifier proximité GPS |

## 🤝 Intégration avec les autres microservices

Voir le fichier `INTEGRATION.md`.