package com.app.umkaSchool.config;

import io.github.cdimascio.dotenv.Dotenv;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DotEnvConfig {
    private static final Logger logger = LoggerFactory.getLogger(DotEnvConfig.class);

    @PostConstruct
    public void loadDotEnv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory(".")
                    .ignoreIfMissing()
                    .load();
            
            // Set system properties from .env file 
            dotenv.entries().forEach(entry -> {
                String key = entry.getKey();
                String value = entry.getValue();
                // Only set if not already set as environment variable
                if (System.getProperty(key) == null && System.getenv(key) == null) {
                    System.setProperty(key, value);
                }
            });
            
            logger.info("Loaded .env file successfully");
        } catch (Exception e) {
            logger.debug("Could not load .env file: {}. Using system environment variables or defaults.", e.getMessage());
        }
    }
}

