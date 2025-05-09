FROM openjdk:21-jdk-slim

LABEL authors="nexol"

ARG JAR_FILE=target/*.jar

WORKDIR /app

COPY ${JAR_FILE} /app/bff-api.jar

ENTRYPOINT ["java", "-jar", "bff-api.jar"]