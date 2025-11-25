package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.repository.AppUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Rollback changes after each test
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @BeforeEach
    void setUp() {
        // Clean up data before each test (optional)
        // appUserRepository.deleteAll();
    }

    @Test
    void testSignup_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Ivan");
        request.setLastName("Ivanov");
        request.setEmail("ivan.test@example.com");
        request.setPassword("password123");
        request.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print()) // Prints request and response details
                .andExpect(status().isOk());
    }

    @Test
    void testSignup_InvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Ivan");
        request.setLastName("Ivanov");
        request.setEmail("invalid-email"); // Invalid email
        request.setPassword("password123");
        request.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignup_ShortPassword() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Ivan");
        request.setLastName("Ivanov");
        request.setEmail("ivan.test2@example.com");
        request.setPassword("12345"); // Too short password (minimum 6 characters)
        request.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignup_MissingFields() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        // firstName, lastName, password, role are missing

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignup_DuplicateEmail() throws Exception {
        // First registration
        RegisterRequest request1 = new RegisterRequest();
        request1.setFirstName("Peter");
        request1.setLastName("Petrov");
        request1.setEmail("duplicate@example.com");
        request1.setPassword("password123");
        request1.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        // Attempt to register with the same email
        RegisterRequest request2 = new RegisterRequest();
        request2.setFirstName("Anna");
        request2.setLastName("Sidorova");
        request2.setEmail("duplicate@example.com"); // Same email
        request2.setPassword("password456");
        request2.setRole("TEACHER");

        // Should return 400 Bad Request for duplicate email
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
