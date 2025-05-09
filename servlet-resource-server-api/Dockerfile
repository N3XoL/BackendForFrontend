FROM openjdk:21-jdk-slim

LABEL authors="nexol"

ARG JAR_FILE=target/*.jar

WORKDIR /app

COPY ${JAR_FILE} /app/servlet-resource-server.jar

ENTRYPOINT ["java", "-jar", "servlet-resource-server.jar"]