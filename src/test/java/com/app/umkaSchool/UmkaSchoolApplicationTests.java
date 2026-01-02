package com.app.umkaSchool;

import com.app.umkaSchool.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("test")
class UmkaSchoolApplicationTests {

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void contextLoads() {
        // This will verify that Spring context loads successfully
    }

    @Test
    void testDatabaseConnection() {
        long userCount = appUserRepository.count();
        System.out.println("Number of users in database: " + userCount);
    }
}
