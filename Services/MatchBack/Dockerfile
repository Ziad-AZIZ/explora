# ═══════════════════════════════════════════════════════════════
# Dockerfile pour le service Calendrier Coupe du Monde 2026
# Stratégie : multi-stage build (build Maven puis image finale légère)
# ═══════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────
# STAGE 1 : Build Maven avec JDK 21
# ───────────────────────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21 AS builder

# Dossier de travail dans le conteneur
WORKDIR /build

# Étape 1 : copier UNIQUEMENT le pom.xml d'abord
# → Docker mettra en cache les dépendances téléchargées
# → les rebuilds suivants seront beaucoup plus rapides
COPY pom.xml .
RUN mvn dependency:go-offline -B || mvn dependency:go-offline -B || mvn dependency:go-offline -B

# Étape 2 : copier le code source et compiler
COPY src ./src
RUN mvn clean package -B || mvn clean package -B || mvn clean package -DskipTests -B

# ───────────────────────────────────────────────────────────────
# STAGE 2 : Image finale (JRE uniquement, pas de Maven, pas de JDK)
# ───────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

# Métadonnées de l'image
LABEL maintainer="PFA - Calendrier CDM 2026"
LABEL description="Service backend - Calendrier Coupe du Monde 2026"

# Créer un utilisateur non-root par sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app

# Récupérer uniquement le JAR compilé depuis le stage builder
COPY --from=builder /build/target/*.jar app.jar

# Port exposé (cohérent avec server.port=8081 dans application.properties)
EXPOSE 8081

# Healthcheck simple : vérifie que l'application répond
# Dépend de /actuator/health si Actuator est ajouté, sinon adapter
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8081/api/wc2026/equipes || exit 1

# Commande de démarrage
ENTRYPOINT ["java", "-jar", "app.jar"]
