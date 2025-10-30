package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.dto.teacher.TeacherResponse;
import com.app.umkaSchool.dto.teacher.UpdateTeacherRequest;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(roles = "TEACHER")  // Добавляем мок-пользователя с ролью TEACHER
class TeacherControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @AfterEach
    void cleanup() {
        teacherRepository.deleteAll();
        appUserRepository.deleteAll();
    }

    @Test
    void createTeacher_ShouldReturnCreatedTeacher() throws Exception {
        CreateTeacherRequest request = new CreateTeacherRequest();
        request.setFirstName("Alice");
        request.setLastName("Smith");
        request.setEmail("alice.smith@test.com");
        request.setPassword("password123");
        request.setBio("Experienced math teacher");
        request.setPhone("+1234567890");

        mockMvc.perform(post("/api/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.email").value("alice.smith@test.com"))
                .andExpect(jsonPath("$.bio").value("Experienced math teacher"));
    }

    @Test
    void updateTeacher_ShouldReturnUpdatedTeacher() throws Exception {
        // Create teacher first
        CreateTeacherRequest createRequest = new CreateTeacherRequest();
        createRequest.setFirstName("Alice");
        createRequest.setLastName("Smith");
        createRequest.setEmail("alice.update@test.com");
        createRequest.setPassword("password123");
        createRequest.setBio("Math teacher");
        createRequest.setPhone("+1234567890");

        String createResponse = mockMvc.perform(post("/api/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        TeacherResponse created = objectMapper.readValue(createResponse, TeacherResponse.class);

        // Update teacher
        UpdateTeacherRequest updateRequest = new UpdateTeacherRequest();
        updateRequest.setFirstName("Alice Updated");
        updateRequest.setBio("Updated bio");

        mockMvc.perform(put("/api/teachers/{teacherId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice Updated"))
                .andExpect(jsonPath("$.bio").value("Updated bio"));
    }

    @Test
    void getTeacherById_ShouldReturnTeacher() throws Exception {
        // Create teacher first
        CreateTeacherRequest createRequest = new CreateTeacherRequest();
        createRequest.setFirstName("Alice");
        createRequest.setLastName("Smith");
        createRequest.setEmail("alice.get@test.com");
        createRequest.setPassword("password123");
        createRequest.setBio("Math teacher");
        createRequest.setPhone("+1234567890");

        String createResponse = mockMvc.perform(post("/api/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        TeacherResponse created = objectMapper.readValue(createResponse, TeacherResponse.class);

        // Get teacher by ID
        mockMvc.perform(get("/api/teachers/{teacherId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.firstName").value("Alice"));
    }

    @Test
    void getAllTeachers_ShouldReturnListOfTeachers() throws Exception {
        // Create a teacher
        CreateTeacherRequest createRequest = new CreateTeacherRequest();
        createRequest.setFirstName("Alice");
        createRequest.setLastName("Smith");
        createRequest.setEmail("alice.all@test.com");
        createRequest.setPassword("password123");
        createRequest.setBio("Math teacher");
        createRequest.setPhone("+1234567890");

        mockMvc.perform(post("/api/teachers")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get all teachers
        mockMvc.perform(get("/api/teachers"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("Alice"));
    }

    @Test
    void deleteTeacher_ShouldReturnNoContent() throws Exception {
        // Create teacher first
        CreateTeacherRequest createRequest = new CreateTeacherRequest();
        createRequest.setFirstName("Alice");
        createRequest.setLastName("Smith");
        createRequest.setEmail("alice.delete@test.com");
        createRequest.setPassword("password123");
        createRequest.setBio("Math teacher");
        createRequest.setPhone("+1234567890");

        String createResponse = mockMvc.perform(post("/api/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        TeacherResponse created = objectMapper.readValue(createResponse, TeacherResponse.class);

        // Delete teacher
        mockMvc.perform(delete("/api/teachers/{teacherId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }
}
