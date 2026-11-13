FROM maven:3.9.9-eclipse-temurin-17 AS builder

WORKDIR /build
COPY pom.xml .
RUN mvn dependency:go-offline -B || mvn dependency:go-offline -B || mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -B || mvn clean package -B || mvn clean package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="PFA - Notifications Service"

RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

WORKDIR /app
COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8084

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8084/api/notifications/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
