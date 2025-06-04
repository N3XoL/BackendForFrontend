package org.example.reactiveresourceserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;

@SpringBootApplication
@EnableReactiveMethodSecurity
public class ReactiveResourceServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ReactiveResourceServerApplication.class, args);
    }

}
