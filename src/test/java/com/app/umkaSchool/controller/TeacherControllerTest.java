package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.RegisterRequest;
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
@org.springframework.test.context.ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "TEACHER")  
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

    private void createUserViaSignup(String email, String firstName, String lastName, String password) throws Exception {
        RegisterRequest signupRequest = new RegisterRequest();
        signupRequest.setEmail(email);
        signupRequest.setFirstName(firstName);
        signupRequest.setLastName(lastName);
        signupRequest.setPassword(password);
        signupRequest.setRole("TEACHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void createTeacher_ShouldReturnCreatedTeacher() throws Exception {
        createUserViaSignup("alice.smith@test.com", "Alice", "Smith", "password123");

        var user = appUserRepository.findByEmail("alice.smith@test.com").orElseThrow();
        var teacher = teacherRepository.findByUser_Id(user.getId()).orElseThrow();

        mockMvc.perform(get("/api/teachers/{teacherId}", teacher.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.email").value("alice.smith@test.com"));
    }

    @Test
    void updateTeacher_ShouldReturnUpdatedTeacher() throws Exception {
        createUserViaSignup("alice.update@test.com", "Alice", "Smith", "password123");

        var user = appUserRepository.findByEmail("alice.update@test.com").orElseThrow();
        var teacher = teacherRepository.findByUser_Id(user.getId()).orElseThrow();

        UpdateTeacherRequest updateRequest = new UpdateTeacherRequest();
        updateRequest.setFirstName("Alice Updated");
        updateRequest.setBio("Updated bio");

        mockMvc.perform(put("/api/teachers/{teacherId}", teacher.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Alice Updated"))
                .andExpect(jsonPath("$.bio").value("Updated bio"));
    }

    @Test
    void getTeacherById_ShouldReturnTeacher() throws Exception {
        createUserViaSignup("alice.get@test.com", "Alice", "Smith", "password123");

        var user = appUserRepository.findByEmail("alice.get@test.com").orElseThrow();
        var teacher = teacherRepository.findByUser_Id(user.getId()).orElseThrow();

        mockMvc.perform(get("/api/teachers/{teacherId}", teacher.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(teacher.getId().toString()))
                .andExpect(jsonPath("$.firstName").value("Alice"));
    }

    @Test
    void getAllTeachers_ShouldReturnListOfTeachers() throws Exception {
        createUserViaSignup("alice.all@test.com", "Alice", "Smith", "password123");

        mockMvc.perform(get("/api/teachers"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].firstName").value("Alice"));
    }

    @Test
    void deleteTeacher_ShouldReturnNoContent() throws Exception {
        createUserViaSignup("alice.delete@test.com", "Alice", "Smith", "password123");

        var user = appUserRepository.findByEmail("alice.delete@test.com").orElseThrow();
        var teacher = teacherRepository.findByUser_Id(user.getId()).orElseThrow();

        mockMvc.perform(delete("/api/teachers/{teacherId}", teacher.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }
}
