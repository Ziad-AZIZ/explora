# 🔌 Intégration avec le microservice Notifications

## 📍 URL de base
- Dev : `http://localhost:8084`
- Prod : `https://api.explora.ma/notifications` (à définir)

## 🤝 Cas d'usage par microservice

### 🔐 Service Auth (inscription / reset password)

#### Quand un user s'inscrit
```http
POST /api/emails/welcome
Content-Type: application/json

{
  "email": "user@example.com",
  "userName": "Mohammed"
}
```

#### Quand un user demande un reset
```http
POST /api/emails/password-reset
Content-Type: application/json

{
  "email": "user@example.com",
  "userName": "Mohammed",
  "resetLink": "https://explora.ma/reset?token=xyz"
}
```

### 🏨 Service Booking (réservations hôtels/restos)

#### Quand une réservation est confirmée
```http
POST /api/emails/booking-confirmation
Content-Type: application/json

{
  "email": "user@example.com",
  "userName": "Mohammed",
  "hotelName": "Hotel Atlas Casablanca",
  "checkInDate": "15 juin 2026",
  "checkOutDate": "18 juin 2026",
  "bookingId": "BK-2026-001234"
}
```

```http
POST /api/notifications/send-templated
Content-Type: application/json

{
  "userId": 1,
  "type": "BOOKING_CONFIRMATION",
  "language": "fr",
  "variables": {
    "hotelName": "Hotel Atlas Casablanca",
    "date": "15 juin 2026"
  }
}
```

### ⚽ Service Matchs

#### Quand un user ajoute un match en favori
```http
POST /api/scheduling/match-reminder
Content-Type: application/json

{
  "userId": 1,
  "matchName": "Maroc vs France",
  "stadium": "Grand Stade de Casablanca",
  "matchDate": "2026-06-15T20:00:00"
}
```

→ Crée automatiquement 3 rappels (J-1, H-2, H-15min).

### 📱 Service Mobile (côté téléphone)

#### Au démarrage de l'app
```http
POST /api/notifications/register-token
Content-Type: application/json

{
  "userId": 1,
  "token": "fcm-token-from-firebase",
  "platform": "android",
  "language": "fr"
}
```

#### Toutes les X minutes pour la géolocalisation
```http
POST /api/proximity/check
Content-Type: application/json

{
  "userId": 1,
  "latitude": 34.0640,
  "longitude": -4.9776,
  "language": "fr"
}
```

#### Pour afficher la cloche
```http
GET /api/notifications/user/1/unread
```

#### Pour marquer comme lue
```http
PUT /api/notifications/{id}/read
```

## 📋 Types de notifications disponibles

| Code | Description |
|---|---|
| `MATCH_REMINDER` | Rappel de match |
| `SECURITY_ALERT` | Alerte sécurité |
| `BOOKING_CONFIRMATION` | Confirmation réservation |
| `PROXIMITY_POI` | Monument à proximité |
| `WEATHER_ALERT` | Alerte météo |
| `FAN_ZONE` | Fan zone à proximité |
| `WELCOME_EMAIL` | Email bienvenue |
| `PASSWORD_RESET` | Email reset mot de passe |
| `EMAIL_VERIFICATION` | Email vérification |

## 🌍 Langues supportées
- `fr` (français — défaut)
- `en` (anglais)
- `ar` (arabe)

Si une langue est demandée mais n'a pas de template → fallback automatique sur `fr`.

## ✅ Format de réponse standard

```json
{
  "success": true,
  "message": "Description de l'action"
}
```

En cas d'erreur :
```json
{
  "success": false,
  "message": "Description de l'erreur"
}
```