package com.app.umkaSchool.controller;

import com.app.umkaSchool.config.TestContainersConfiguration;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.StudentRepository;
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

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(username = "student", roles = {"STUDENT"})
class AchievementControllerTest extends TestContainersConfiguration {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private StudentRepository studentRepository;

    private UUID studentId;

    @BeforeEach
    void setUp() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("Student");
        registerRequest.setEmail("test.student@example.com");
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

        var user = appUserRepository.findByEmail("test.student@example.com").orElseThrow();
        var student = studentRepository.findByUser_Id(user.getId()).orElseThrow();
        studentId = student.getId();
    }

    @Test
    void getAllAchievements_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/achievements")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getStudentAchievements_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/achievements/student/" + studentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getRecentStudentAchievements_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/achievements/student/" + studentId + "/recent")
                        .param("hours", "24")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getRecentStudentAchievements_WithDefaultHours_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/achievements/student/" + studentId + "/recent")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getStudentAchievements_WithInvalidStudentId_ShouldReturnEmptyList() throws Exception {
        UUID invalidId = UUID.randomUUID();
        mockMvc.perform(get("/api/achievements/student/" + invalidId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}

