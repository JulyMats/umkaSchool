package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.model.AppUser;
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
@WithMockUser(roles = "STUDENT")
class ProgressSnapshotControllerTest {

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
        registerRequest.setEmail("test.student.snapshot@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setRole("STUDENT");
        registerRequest.setDateOfBirth(java.time.LocalDate.of(2010, 1, 1));
        registerRequest.setGuardianFirstName("Guardian");
        registerRequest.setGuardianLastName("Name");
        registerRequest.setGuardianEmail("guardian.snapshot@example.com");
        registerRequest.setGuardianPhone("123456789");
        registerRequest.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());

        AppUser user = appUserRepository.findByEmail("test.student.snapshot@example.com").orElseThrow();
        Student student = studentRepository.findByUser_Id(user.getId()).orElseThrow();
        studentId = student.getId();
    }

    @Test
    void getSnapshotsByStudent_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/progress-snapshots/student/" + studentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getLatestSnapshot_ShouldReturnSnapshot() throws Exception {
        mockMvc.perform(get("/api/progress-snapshots/student/" + studentId + "/latest")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound()); 
    }

    @Test
    void getSnapshotsByDateRange_ShouldReturnList() throws Exception {
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();

        mockMvc.perform(get("/api/progress-snapshots/student/" + studentId + "/date-range")
                        .param("startDate", startDate.toString())
                        .param("endDate", endDate.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getSnapshotByDate_ShouldReturnSnapshot() throws Exception {
        LocalDate date = LocalDate.now();
        mockMvc.perform(get("/api/progress-snapshots/student/" + studentId + "/date/" + date)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound()); 
    }

    @Test
    void getStudentStats_WithAllPeriod_ShouldReturnStats() throws Exception {
        mockMvc.perform(get("/api/progress-snapshots/student/" + studentId + "/stats")
                        .param("period", "all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    void getStudentStats_WithInvalidPeriod_ShouldReturnBadRequest() throws Exception {
        mockMvc.perform(get("/api/progress-snapshots/student/" + studentId + "/stats")
                        .param("period", "invalid")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void getSnapshotsByStudent_WithInvalidStudentId_ShouldReturnNotFound() throws Exception {
        UUID invalidId = UUID.randomUUID();
        mockMvc.perform(get("/api/progress-snapshots/student/" + invalidId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}

