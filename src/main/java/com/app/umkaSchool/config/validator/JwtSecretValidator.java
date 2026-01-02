package com.app.umkaSchool.config.validator;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;

/**
 * Validates JWT secret configuration during application startup.
 * Prevents application from running with insecure or missing JWT secret.
 */
@Component
public class JwtSecretValidator {

    private static final Logger logger = LoggerFactory.getLogger(JwtSecretValidator.class);
    private static final int MIN_SECRET_LENGTH = 32; // 256 bits 

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${spring.profiles.active:}")
    private String activeProfile;

    /**
     * Validates JWT secret configuration when application is ready.
     * This runs after all beans are initialized but before the application starts accepting requests.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Order(1) 
    public void validateJwtSecret() {
        logger.info("Validating JWT secret configuration...");

        // Skip validation in test profile (test configuration has its own secret)
        if ("test".equals(activeProfile)) {
            logger.debug("Skipping JWT secret validation in test profile");
            return;
        }

        if (jwtSecret == null || jwtSecret.trim().isEmpty()) {
            String errorMessage = """
                ========================================================================
                CRITICAL SECURITY ERROR: JWT_SECRET is not configured!
                ========================================================================
                The application cannot start without a valid JWT secret.
                
                Please set the JWT_SECRET environment variable or add it to your .env file:
                
                For development (.env.local):
                  JWT_SECRET=your-secret-key-here-minimum-32-characters-long
                
                For production (.env.production):
                  JWT_SECRET=your-very-secure-production-secret-key-minimum-256-bits
                
                Generate a secure secret using:
                  openssl rand -base64 32
                
                ========================================================================
                """;
            logger.error(errorMessage);
            throw new IllegalStateException(
                "JWT_SECRET is not configured. Please set JWT_SECRET environment variable " +
                "or add it to your .env file. Minimum length: 32 characters (256 bits)."
            );
        }

        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < MIN_SECRET_LENGTH) {
            String errorMessage = String.format("""
                ========================================================================
                CRITICAL SECURITY ERROR: JWT_SECRET is too short!
                ========================================================================
                Current length: %d bytes
                Required minimum: %d bytes (256 bits)
                
                Your JWT secret is too short and insecure. Please generate a new secret:
                
                  openssl rand -base64 32
                
                Then update your JWT_SECRET in .env file or environment variables.
                ========================================================================
                """, keyBytes.length, MIN_SECRET_LENGTH);
            logger.error(errorMessage);
            throw new IllegalStateException(
                String.format(
                    "JWT_SECRET is too short. Current: %d bytes, Required: %d+ bytes (256 bits). " +
                    "Generate a secure secret with at least 32 characters using: openssl rand -base64 32",
                    keyBytes.length, MIN_SECRET_LENGTH
                )
            );
        }

        String[] insecureValues = {
            "secret", "password", "123456", "changeme", "default", "test",
            "your-secret-key-here", "your-very-secure-production-secret-key"
        };
        String secretLower = jwtSecret.toLowerCase().trim();
        for (String insecure : insecureValues) {
            if (secretLower.contains(insecure)) {
                logger.warn("JWT_SECRET contains potentially insecure value: '{}'. Please use a strong, unique secret.", insecure);
            }
        }

        logger.info("JWT secret validation passed. Secret length: {} bytes ({} bits)", 
            keyBytes.length, keyBytes.length * 8);
    }
}

