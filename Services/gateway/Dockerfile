FROM maven:3.9.6-eclipse-temurin-17-alpine AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B || mvn dependency:go-offline -B || mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -B || mvn clean package -B || mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/gateway-0.0.1-SNAPSHOT.jar gateway.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "gateway.jar"]
