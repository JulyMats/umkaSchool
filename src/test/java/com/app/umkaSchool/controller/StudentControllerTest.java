package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.dto.student.StudentResponse;
import com.app.umkaSchool.dto.student.UpdateStudentRequest;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.StudentRepository;
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

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "TEACHER") 
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @AfterEach
    void cleanup() {
        studentRepository.deleteAll();
        appUserRepository.deleteAll();
    }

    private void createUserViaSignup(String email, String firstName, String lastName, String password) throws Exception {
        RegisterRequest signupRequest = new RegisterRequest();
        signupRequest.setEmail(email);
        signupRequest.setFirstName(firstName);
        signupRequest.setLastName(lastName);
        signupRequest.setPassword(password);
        signupRequest.setRole("STUDENT");
        signupRequest.setDateOfBirth(LocalDate.of(2010, 5, 15));
        signupRequest.setGuardianFirstName("Guardian");
        signupRequest.setGuardianLastName("Name");
        signupRequest.setGuardianEmail("guardian." + email);
        signupRequest.setGuardianPhone("123456789");
        signupRequest.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void createStudent_ShouldReturnCreatedStudent() throws Exception {
        createUserViaSignup("john.doe@test.com", "John", "Doe", "password123");

        var user = appUserRepository.findByEmail("john.doe@test.com").orElseThrow();
        var student = studentRepository.findByUser_Id(user.getId()).orElseThrow();

        mockMvc.perform(get("/api/students/{studentId}", student.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@test.com"));
    }

    @Test
    void updateStudent_ShouldReturnUpdatedStudent() throws Exception {
        createUserViaSignup("john.update@test.com", "John", "Doe", "password123");

        var user = appUserRepository.findByEmail("john.update@test.com").orElseThrow();
        var student = studentRepository.findByUser_Id(user.getId()).orElseThrow();

        UpdateStudentRequest updateRequest = new UpdateStudentRequest();
        updateRequest.setFirstName("John Updated");

        mockMvc.perform(put("/api/students/{studentId}", student.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John Updated"));
    }

    @Test
    void getStudentById_ShouldReturnStudent() throws Exception {
        createUserViaSignup("john.get@test.com", "John", "Doe", "password123");

        var user = appUserRepository.findByEmail("john.get@test.com").orElseThrow();
        var student = studentRepository.findByUser_Id(user.getId()).orElseThrow();

        mockMvc.perform(get("/api/students/{studentId}", student.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(student.getId().toString()))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void getAllStudents_ShouldReturnListOfStudents() throws Exception {
        createUserViaSignup("john.all@test.com", "John", "Doe", "password123");

        mockMvc.perform(get("/api/students"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].firstName").value("John"));
    }

    @Test
    void deleteStudent_ShouldReturnNoContent() throws Exception {
        createUserViaSignup("john.delete@test.com", "John", "Doe", "password123");

        var user = appUserRepository.findByEmail("john.delete@test.com").orElseThrow();
        var student = studentRepository.findByUser_Id(user.getId()).orElseThrow();

        mockMvc.perform(delete("/api/students/{studentId}", student.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }
}
