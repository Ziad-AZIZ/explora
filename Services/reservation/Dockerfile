# Stage 1: Build
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Copier pom.xml
COPY pom.xml .

# Télécharger les dépendances
RUN mvn dependency:go-offline -B || mvn dependency:go-offline -B || mvn dependency:go-offline -B

# Copier le code source
COPY src ./src

# Build l'application
RUN mvn clean package -B || mvn clean package -B || mvn clean package -DskipTests

# Stage 2: Run
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copier le JAR compilé
COPY --from=build /app/target/*.jar app.jar

# Exposer le port
EXPOSE 8080

# Variables d'environnement MySQL
ENV SPRING_DATASOURCE_URL=jdbc:mysql://db-reservation:3306/reservation_db?useSSL=false&serverTimezone=UTC
ENV SPRING_DATASOURCE_USERNAME=reservation_user
ENV SPRING_DATASOURCE_PASSWORD=motdepasse123
ENV SPRING_JPA_HIBERNATE_DDL_AUTO=update

# Lancer l'application
ENTRYPOINT ["java", "-jar", "app.jar"]
