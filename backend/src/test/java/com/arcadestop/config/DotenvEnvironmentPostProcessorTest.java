package com.arcadestop.config;

import org.junit.jupiter.api.Test;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.StandardEnvironment;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class DotenvEnvironmentPostProcessorTest {

    @Test
    void testLoadsPropertiesFromEnvExample() {
        Map<String, Object> props = DotenvEnvironmentPostProcessor.loadDotenvProperties();
        assertNotNull(props);
        assertTrue(props.containsKey("DB_USERNAME"), "Should load DB_USERNAME from .env/.env.example");
        assertEquals("vishalpost", props.get("DB_USERNAME"));
        assertEquals("vishal123", props.get("DB_PASSWORD"));
        assertEquals("jdbc:postgresql://localhost:5432/arcadestop", props.get("DB_URL"));
    }

    @Test
    void testPostProcessEnvironmentAddsPropertySource() {
        DotenvEnvironmentPostProcessor processor = new DotenvEnvironmentPostProcessor();
        ConfigurableEnvironment environment = new StandardEnvironment();
        processor.postProcessEnvironment(environment, new SpringApplication());

        assertTrue(environment.getPropertySources().contains(DotenvEnvironmentPostProcessor.PROPERTY_SOURCE_NAME));
        assertEquals("vishalpost", environment.getProperty("DB_USERNAME"));
    }
}
