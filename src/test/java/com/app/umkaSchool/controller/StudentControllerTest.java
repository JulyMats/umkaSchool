package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.dto.student.StudentResponse;
import com.app.umkaSchool.dto.student.UpdateStudentRequest;
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
@Transactional
@WithMockUser(roles = "TEACHER")  // Добавляем мок-пользователя с ролью TEACHER
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

    @Test
    void createStudent_ShouldReturnCreatedStudent() throws Exception {
        CreateStudentRequest request = new CreateStudentRequest();
        request.setFirstName("John");
        request.setLastName("Doe");
        request.setEmail("john.doe@test.com");
        request.setPassword("password123");
        request.setDateOfBirth(LocalDate.of(2010, 5, 15));
        request.setGuardianFirstName("Jane");
        request.setGuardianLastName("Doe");
        request.setGuardianEmail("jane.doe@test.com");
        request.setGuardianPhone("+1234567890");
        request.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@test.com"))
                .andExpect(jsonPath("$.guardian.firstName").value("Jane"));
    }

    @Test
    void updateStudent_ShouldReturnUpdatedStudent() throws Exception {
        // Create student first
        CreateStudentRequest createRequest = new CreateStudentRequest();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.update@test.com");
        createRequest.setPassword("password123");
        createRequest.setDateOfBirth(LocalDate.of(2010, 5, 15));
        createRequest.setGuardianFirstName("Jane");
        createRequest.setGuardianLastName("Doe");
        createRequest.setGuardianEmail("jane.update@test.com");
        createRequest.setGuardianPhone("+1234567890");
        createRequest.setGuardianRelationship("MOTHER");

        String createResponse = mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        StudentResponse created = objectMapper.readValue(createResponse, StudentResponse.class);

        // Update student
        UpdateStudentRequest updateRequest = new UpdateStudentRequest();
        updateRequest.setFirstName("John Updated");

        mockMvc.perform(put("/api/students/{studentId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John Updated"));
    }

    @Test
    void getStudentById_ShouldReturnStudent() throws Exception {
        // Create student first
        CreateStudentRequest createRequest = new CreateStudentRequest();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.get@test.com");
        createRequest.setPassword("password123");
        createRequest.setDateOfBirth(LocalDate.of(2010, 5, 15));
        createRequest.setGuardianFirstName("Jane");
        createRequest.setGuardianLastName("Doe");
        createRequest.setGuardianEmail("jane.get@test.com");
        createRequest.setGuardianPhone("+1234567890");
        createRequest.setGuardianRelationship("MOTHER");

        String createResponse = mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        StudentResponse created = objectMapper.readValue(createResponse, StudentResponse.class);

        // Get student by ID
        mockMvc.perform(get("/api/students/{studentId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.firstName").value("John"));
    }

    @Test
    void getAllStudents_ShouldReturnListOfStudents() throws Exception {
        // Create a student
        CreateStudentRequest createRequest = new CreateStudentRequest();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.all@test.com");
        createRequest.setPassword("password123");
        createRequest.setDateOfBirth(LocalDate.of(2010, 5, 15));
        createRequest.setGuardianFirstName("Jane");
        createRequest.setGuardianLastName("Doe");
        createRequest.setGuardianEmail("jane.all@test.com");
        createRequest.setGuardianPhone("+1234567890");
        createRequest.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get all students
        mockMvc.perform(get("/api/students"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("John"));
    }

    @Test
    void deleteStudent_ShouldReturnNoContent() throws Exception {
        // Create student first
        CreateStudentRequest createRequest = new CreateStudentRequest();
        createRequest.setFirstName("John");
        createRequest.setLastName("Doe");
        createRequest.setEmail("john.delete@test.com");
        createRequest.setPassword("password123");
        createRequest.setDateOfBirth(LocalDate.of(2010, 5, 15));
        createRequest.setGuardianFirstName("Jane");
        createRequest.setGuardianLastName("Doe");
        createRequest.setGuardianEmail("jane.delete@test.com");
        createRequest.setGuardianPhone("+1234567890");
        createRequest.setGuardianRelationship("MOTHER");

        String createResponse = mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        StudentResponse created = objectMapper.readValue(createResponse, StudentResponse.class);

        // Delete student
        mockMvc.perform(delete("/api/students/{studentId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }
}
