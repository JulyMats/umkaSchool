package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exerciseattempt.CreateExerciseAttemptRequest;
import com.app.umkaSchool.dto.exerciseattempt.ExerciseAttemptResponse;
import com.app.umkaSchool.dto.exerciseattempt.UpdateExerciseAttemptRequest;
import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.dto.student.StudentResponse;
import com.app.umkaSchool.repository.ExerciseAttemptRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(roles = "TEACHER")
class ExerciseAttemptControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExerciseAttemptRepository exerciseAttemptRepository;

    private UUID studentId;
    private UUID exerciseId;

    @BeforeEach
    void setup() throws Exception {
        // Create a student
        CreateStudentRequest studentRequest = new CreateStudentRequest();
        studentRequest.setFirstName("Test");
        studentRequest.setLastName("Student");
        studentRequest.setEmail("test.attempt@student.com");
        studentRequest.setPassword("password123");
        studentRequest.setDateOfBirth(LocalDate.of(2010, 5, 15));
        studentRequest.setGuardianFirstName("Test");
        studentRequest.setGuardianLastName("Guardian");
        studentRequest.setGuardianEmail("test.guardian.attempt@test.com");
        studentRequest.setGuardianPhone("+1234567890");
        studentRequest.setGuardianRelationship("MOTHER");

        String studentResponse = mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(studentRequest)))
                .andReturn().getResponse().getContentAsString();

        StudentResponse student = objectMapper.readValue(studentResponse, StudentResponse.class);
        studentId = student.getId();

        // Create an exercise type
        CreateExerciseTypeRequest typeRequest = new CreateExerciseTypeRequest();
        typeRequest.setName("Test Attempt Exercise Type");
        typeRequest.setDescription("Test description");
        typeRequest.setBaseDifficulty(3);
        typeRequest.setAvgTimeSeconds(120);

        String typeResponse = mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(typeRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseTypeResponse exerciseType = objectMapper.readValue(typeResponse, ExerciseTypeResponse.class);

        // Create an exercise
        CreateExerciseRequest exerciseRequest = new CreateExerciseRequest();
        exerciseRequest.setExerciseTypeId(exerciseType.getId());
        exerciseRequest.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        exerciseRequest.setDifficulty(3);
        exerciseRequest.setEstimatedSeconds(120);
        exerciseRequest.setPoints(10);

        String exerciseResponse = mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exerciseRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseResponse exercise = objectMapper.readValue(exerciseResponse, ExerciseResponse.class);
        exerciseId = exercise.getId();
    }

    @AfterEach
    void cleanup() {
        exerciseAttemptRepository.deleteAll();
    }

    @Test
    void createExerciseAttempt_ShouldReturnCreatedAttempt() throws Exception {
        CreateExerciseAttemptRequest request = new CreateExerciseAttemptRequest();
        request.setStudentId(studentId);
        request.setExerciseId(exerciseId);
        request.setScore(85);
        request.setTimeSpentSeconds(100);
        request.setAccuracy(new BigDecimal("95.50"));
        request.setMistakes(2);

        mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(studentId.toString()))
                .andExpect(jsonPath("$.exerciseId").value(exerciseId.toString()))
                .andExpect(jsonPath("$.score").value(85))
                .andExpect(jsonPath("$.timeSpentSeconds").value(100))
                .andExpect(jsonPath("$.accuracy").value(95.50))
                .andExpect(jsonPath("$.mistakes").value(2));
    }

    @Test
    void updateExerciseAttempt_ShouldReturnUpdatedAttempt() throws Exception {
        // Create attempt first
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setScore(85);
        createRequest.setTimeSpentSeconds(100);
        createRequest.setAccuracy(new BigDecimal("95.50"));
        createRequest.setMistakes(2);

        String createResponse = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResponse, ExerciseAttemptResponse.class);

        // Update attempt
        UpdateExerciseAttemptRequest updateRequest = new UpdateExerciseAttemptRequest();
        updateRequest.setScore(90);
        updateRequest.setMistakes(1);

        mockMvc.perform(put("/api/exercise-attempts/{attemptId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(90))
                .andExpect(jsonPath("$.mistakes").value(1));
    }

    @Test
    void getExerciseAttemptById_ShouldReturnAttempt() throws Exception {
        // Create attempt first
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setScore(85);
        createRequest.setTimeSpentSeconds(100);
        createRequest.setAccuracy(new BigDecimal("95.50"));
        createRequest.setMistakes(2);

        String createResponse = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResponse, ExerciseAttemptResponse.class);

        // Get attempt by ID
        mockMvc.perform(get("/api/exercise-attempts/{attemptId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.score").value(85));
    }

    @Test
    void getAllExerciseAttempts_ShouldReturnListOfAttempts() throws Exception {
        // Create an attempt
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setScore(85);
        createRequest.setTimeSpentSeconds(100);
        createRequest.setAccuracy(new BigDecimal("95.50"));
        createRequest.setMistakes(2);

        mockMvc.perform(post("/api/exercise-attempts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get all attempts
        mockMvc.perform(get("/api/exercise-attempts"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].score").value(85));
    }

    @Test
    void getExerciseAttemptsByStudent_ShouldReturnListOfAttempts() throws Exception {
        // Create an attempt
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setScore(85);
        createRequest.setTimeSpentSeconds(100);
        createRequest.setAccuracy(new BigDecimal("95.50"));
        createRequest.setMistakes(2);

        mockMvc.perform(post("/api/exercise-attempts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get attempts by student
        mockMvc.perform(get("/api/exercise-attempts/student/{studentId}", studentId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentId").value(studentId.toString()));
    }

    @Test
    void deleteExerciseAttempt_ShouldReturnNoContent() throws Exception {
        // Create attempt first
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setScore(85);
        createRequest.setTimeSpentSeconds(100);
        createRequest.setAccuracy(new BigDecimal("95.50"));
        createRequest.setMistakes(2);

        String createResponse = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResponse, ExerciseAttemptResponse.class);

        // Delete attempt
        mockMvc.perform(delete("/api/exercise-attempts/{attemptId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    void createExerciseAttempt_WithInvalidAccuracy_ShouldReturnBadRequest() throws Exception {
        CreateExerciseAttemptRequest request = new CreateExerciseAttemptRequest();
        request.setStudentId(studentId);
        request.setExerciseId(exerciseId);
        request.setScore(85);
        request.setTimeSpentSeconds(100);
        request.setAccuracy(new BigDecimal("150.00")); // Invalid: must be between 0 and 100
        request.setMistakes(2);

        mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}

