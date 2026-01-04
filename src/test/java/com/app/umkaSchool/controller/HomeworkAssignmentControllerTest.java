package com.app.umkaSchool.controller;

import com.app.umkaSchool.config.TestContainersConfiguration;
import com.app.umkaSchool.model.enums.HomeworkStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(username = "teacher", roles = {"TEACHER"})
class HomeworkAssignmentControllerTest extends TestContainersConfiguration {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getAllHomeworkAssignments_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/homework-assignments")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getHomeworkAssignmentsByStatus_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/homework-assignments/status/PENDING")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getHomeworkAssignmentsByHomework_ShouldReturnList() throws Exception {
        UUID homeworkId = UUID.randomUUID();
        mockMvc.perform(get("/api/homework-assignments/homework/" + homeworkId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getHomeworkAssignmentsByTeacher_ShouldReturnList() throws Exception {
        UUID teacherId = UUID.randomUUID();
        mockMvc.perform(get("/api/homework-assignments/teacher/" + teacherId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getHomeworkAssignmentsByGroup_ShouldReturnList() throws Exception {
        UUID groupId = UUID.randomUUID();
        mockMvc.perform(get("/api/homework-assignments/group/" + groupId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getHomeworkAssignmentsByStudent_ShouldReturnList() throws Exception {
        UUID studentId = UUID.randomUUID();
        mockMvc.perform(get("/api/homework-assignments/student/" + studentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getHomeworkAssignmentById_WithInvalidId_ShouldReturnNotFound() throws Exception {
        UUID invalidId = UUID.randomUUID();
        mockMvc.perform(get("/api/homework-assignments/" + invalidId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());
    }

    @Test
    void updateOverdueAssignments_ShouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/homework-assignments/update-overdue")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk());
    }
}

