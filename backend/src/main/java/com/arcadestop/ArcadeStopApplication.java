package com.arcadestop;

import com.arcadestop.config.DotenvEnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ArcadeStopApplication {

    public static void main(String[] args) {
        // Pre-load environment properties from .env or .env.example if present
        DotenvEnvironmentPostProcessor.loadDotenvProperties();
        SpringApplication.run(ArcadeStopApplication.class, args);
    }
}
