package com.app.umkaSchool;

import com.app.umkaSchool.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class UmkaSchoolApplicationTests {

    @Autowired
    private AppUserRepository appUserRepository;

    @Test
    void contextLoads() {
        // This will verify that Spring context loads successfully
    }

    @Test
    void testDatabaseConnection() {
        // This will verify database connection by executing a simple query
        long userCount = appUserRepository.count();
        // If this doesn't throw an exception, the connection is successful
        System.out.println("Number of users in database: " + userCount);
    }
}
