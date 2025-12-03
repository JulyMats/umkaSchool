package com.app.umkaSchool;

import io.github.cdimascio.dotenv.Dotenv;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class UmkaSchoolApplication {
	private static final Logger logger = LoggerFactory.getLogger(UmkaSchoolApplication.class);

	static {
		// Load .env file 
		try {
			Dotenv dotenv = Dotenv.configure()
					.directory(".")
					.ignoreIfMissing()
					.load();
			
			// Set system properties from .env file 
			dotenv.entries().forEach(entry -> {
				String key = entry.getKey();
				String value = entry.getValue();
				// Set if not already set as environment variable
				if (System.getProperty(key) == null && System.getenv(key) == null) {
					System.setProperty(key, value);
				}
			});
			
			logger.info("Loaded .env file successfully");
		} catch (Exception e) {
			logger.debug("Could not load .env file: {}. Using system environment variables or defaults.", e.getMessage());
		}
	}

	public static void main(String[] args) {
		SpringApplication.run(UmkaSchoolApplication.class, args);
	}

}
