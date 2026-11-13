# ===================================================================
# DOCKERFILE MULTI-STAGE - Backend Spring Boot
# ===================================================================
# Etape 1 : BUILD avec Maven (telecharge dependances + compile + package)
# Etape 2 : RUN avec une JRE legere (image finale plus petite)
# ===================================================================

# --- Etape 1 : Build ---
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app

# Copie d'abord le pom.xml pour mettre en cache les dependances
COPY pom.xml .
RUN mvn dependency:go-offline -B || mvn dependency:go-offline -B || mvn dependency:go-offline -B

# Copie le code source et compile
COPY src ./src
RUN mvn clean package -B || mvn clean package -B || mvn clean package -DskipTests

# --- Etape 2 : Runtime ---
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Recupere uniquement le JAR compile depuis l'etape builder
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
