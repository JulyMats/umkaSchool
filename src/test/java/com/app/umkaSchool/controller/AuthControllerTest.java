package com.app.umkaSchool.controller;

import com.app.umkaSchool.config.TestContainersConfiguration;
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
@org.springframework.test.context.ActiveProfiles("test")
@Transactional 
class AuthControllerTest extends TestContainersConfiguration {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testSignup_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Ivan");
        request.setLastName("Ivanov");
        request.setEmail("ivan.test@example.com");
        request.setPassword("password123");
        request.setRole("STUDENT");
        request.setDateOfBirth(java.time.LocalDate.of(2010, 1, 1));
        request.setGuardianFirstName("Guardian");
        request.setGuardianLastName("Name");
        request.setGuardianEmail("guardian.ivan@example.com");
        request.setGuardianPhone("123456789");
        request.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print()) 
                .andExpect(status().isOk());
    }

    @Test
    void testSignup_InvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Ivan");
        request.setLastName("Ivanov");
        request.setEmail("invalid-email"); 
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
        request.setPassword("12345"); 
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

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignup_DuplicateEmail() throws Exception {
        RegisterRequest request1 = new RegisterRequest();
        request1.setFirstName("Peter");
        request1.setLastName("Petrov");
        request1.setEmail("duplicate@example.com");
        request1.setPassword("password123");
        request1.setRole("STUDENT");
        request1.setDateOfBirth(java.time.LocalDate.of(2010, 1, 1));
        request1.setGuardianFirstName("Guardian");
        request1.setGuardianLastName("Name");
        request1.setGuardianEmail("guardian.duplicate@example.com");
        request1.setGuardianPhone("123456789");
        request1.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        RegisterRequest request2 = new RegisterRequest();
        request2.setFirstName("Anna");
        request2.setLastName("Sidorova");
        request2.setEmail("duplicate@example.com"); 
        request2.setPassword("password456");
        request2.setRole("TEACHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andDo(print())
                .andExpect(status().isConflict());
    }
}
