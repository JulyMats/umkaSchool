package com.app.umkaSchool.config;

import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Create admin user if no users exist
        if (userRepository.count() == 0) {
            AppUser adminUser = new AppUser();
            adminUser.setId(UUID.randomUUID());
            adminUser.setEmail("admin@umkaschool.com");
            adminUser.setPasswordHash(passwordEncoder.encode("admin123")); // You should change this password
            adminUser.setFirstName("Admin");
            adminUser.setLastName("User");
            adminUser.setUserRole(AppUser.UserRole.ADMIN);
            adminUser.setActive(true);
            adminUser.setAvatarUrl("/static/default-avatar.png");
            adminUser.setAppLanguage("EN");

            userRepository.save(adminUser);
            
            System.out.println("Created initial admin user:");
            System.out.println("Email: admin@umkaschool.com");
            System.out.println("Password: admin123");
        }
    }
}