package com.arcadestop.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Automatically detects and loads properties from .env and .env.example files
 * into the Spring Environment and System properties before bean initialization.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(DotenvEnvironmentPostProcessor.class);
    public static final String PROPERTY_SOURCE_NAME = "dotenvProperties";

    @Override
    public int getOrder() {
        // Run before ConfigDataEnvironmentPostProcessor so properties are available for placeholders
        return Ordered.HIGHEST_PRECEDENCE + 10;
    }

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> envProperties = loadDotenvProperties();

        if (!envProperties.isEmpty()) {
            if (environment.getPropertySources().contains(StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME)) {
                environment.getPropertySources().addAfter(
                        StandardEnvironment.SYSTEM_ENVIRONMENT_PROPERTY_SOURCE_NAME,
                        new MapPropertySource(PROPERTY_SOURCE_NAME, envProperties)
                );
            } else {
                environment.getPropertySources().addFirst(
                        new MapPropertySource(PROPERTY_SOURCE_NAME, envProperties)
                );
            }
        }
    }

    /**
     * Loads properties from .env.example (defaults) and .env (overrides),
     * and sets them in System properties if not already set.
     */
    public static Map<String, Object> loadDotenvProperties() {
        Map<String, Object> targetMap = new LinkedHashMap<>();

        // 1. Load base template (.env.example)
        findAndParse(new String[]{
                ".env.example",
                "backend/.env.example",
                "../backend/.env.example",
                "../.env.example"
        }, targetMap);

        // 2. Load environment overrides (.env)
        findAndParse(new String[]{
                ".env",
                "backend/.env",
                "../backend/.env",
                "../.env"
        }, targetMap);

        for (Map.Entry<String, Object> entry : targetMap.entrySet()) {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), String.valueOf(entry.getValue()));
            }
        }

        return targetMap;
    }

    private static void findAndParse(String[] candidates, Map<String, Object> targetMap) {
        for (String relativePath : candidates) {
            File file = new File(relativePath);
            if (file.exists() && file.isFile()) {
                parseEnvFile(file, targetMap);
                break;
            }
        }
    }

    private static void parseEnvFile(File file, Map<String, Object> targetMap) {
        try (BufferedReader reader = new BufferedReader(new FileReader(file, StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) {
                    continue;
                }
                int eqIdx = line.indexOf('=');
                if (eqIdx > 0) {
                    String key = line.substring(0, eqIdx).trim();
                    String value = line.substring(eqIdx + 1).trim();
                    if ((value.startsWith("\"") && value.endsWith("\"") && value.length() >= 2) ||
                        (value.startsWith("'") && value.endsWith("'") && value.length() >= 2)) {
                        value = value.substring(1, value.length() - 1);
                    }
                    targetMap.put(key, value);
                }
            }
            logger.info("Loaded environment properties from: {}", file.getAbsolutePath());
        } catch (IOException e) {
            logger.warn("Could not read env file {}: {}", file.getPath(), e.getMessage());
        }
    }
}
