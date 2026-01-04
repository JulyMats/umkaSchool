package com.app.umkaSchool.controller;

import com.app.umkaSchool.config.TestContainersConfiguration;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.user.UpdateUserRequest;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.repository.AppUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "ADMIN")
class UserControllerTest extends TestContainersConfiguration {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    private UUID userId;
    private String userEmail;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");
        registerRequest.setEmail("test.user@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setRole("STUDENT");
        registerRequest.setDateOfBirth(java.time.LocalDate.of(2010, 1, 1));
        registerRequest.setGuardianFirstName("Guardian");
        registerRequest.setGuardianLastName("Name");
        registerRequest.setGuardianEmail("guardian@example.com");
        registerRequest.setGuardianPhone("123456789");
        registerRequest.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        AppUser user = appUserRepository.findByEmail("test.user@example.com").orElseThrow();
        userId = user.getId();
        userEmail = user.getEmail();
    }

    @Test
    void getUserById_ShouldReturnUser() throws Exception {
        mockMvc.perform(get("/api/users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(userId.toString()))
                .andExpect(jsonPath("$.email").value(userEmail))
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.lastName").value("User"));
    }

    @Test
    void getUserByEmail_ShouldReturnUser() throws Exception {
        mockMvc.perform(get("/api/users/email/" + userEmail)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(userEmail))
                .andExpect(jsonPath("$.firstName").value("Test"));
    }

    @Test
    void getAllUsers_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    void updateUser_ShouldReturnUpdatedUser() throws Exception {
        UpdateUserRequest updateRequest = new UpdateUserRequest();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");
        updateRequest.setEmail("updated@example.com");

        mockMvc.perform(put("/api/users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Name"))
                .andExpect(jsonPath("$.email").value("updated@example.com"));
    }

    @Test
    void deactivateUser_ShouldDeactivateUser() throws Exception {
        mockMvc.perform(put("/api/users/" + userId + "/deactivate")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());

        AppUser user = appUserRepository.findById(userId).orElseThrow();
        assertFalse(user.isActive());
    }

    @Test
    void activateUser_ShouldActivateUser() throws Exception {
        AppUser user = appUserRepository.findById(userId).orElseThrow();
        user.setActive(false);
        appUserRepository.save(user);

        mockMvc.perform(put("/api/users/" + userId + "/activate")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());

        user = appUserRepository.findById(userId).orElseThrow();
        assertTrue(user.isActive());
    }

    @Test
    void deleteUser_ShouldDeleteUser() throws Exception {
        mockMvc.perform(delete("/api/users/" + userId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNoContent());

        assertTrue(appUserRepository.findById(userId).isEmpty());
    }

    @Test
    void getUserById_WithInvalidId_ShouldReturnNotFound() throws Exception {
        UUID invalidId = UUID.randomUUID();
        mockMvc.perform(get("/api/users/" + invalidId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}

