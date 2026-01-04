package com.app.umkaSchool.controller;

import com.app.umkaSchool.config.TestContainersConfiguration;
import com.app.umkaSchool.dto.auth.RegisterRequest;
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

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "TEACHER")
class ExerciseAttemptControllerTest extends TestContainersConfiguration {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExerciseAttemptRepository exerciseAttemptRepository;

    @Autowired
    private com.app.umkaSchool.repository.AppUserRepository appUserRepository;

    @Autowired
    private com.app.umkaSchool.repository.StudentRepository studentRepository;

    private UUID studentId;
    private UUID exerciseId;

    @BeforeEach
    void setup() throws Exception {
        RegisterRequest signupRequest = new RegisterRequest();
        signupRequest.setEmail("test.attempt@student.com");
        signupRequest.setFirstName("Test");
        signupRequest.setLastName("Student");
        signupRequest.setPassword("password123");
        signupRequest.setRole("STUDENT");
        signupRequest.setDateOfBirth(LocalDate.of(2010, 5, 15));
        signupRequest.setGuardianFirstName("Test");
        signupRequest.setGuardianLastName("Guardian");
        signupRequest.setGuardianEmail("test.guardian.attempt@test.com");
        signupRequest.setGuardianPhone("+1234567890");
        signupRequest.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        var user = appUserRepository.findByEmail("test.attempt@student.com").orElseThrow();
        var student = studentRepository.findByUser_Id(user.getId()).orElseThrow();
        studentId = student.getId();

        CreateExerciseTypeRequest typeRequest = new CreateExerciseTypeRequest();
        typeRequest.setName("Test Attempt Exercise Type");
        typeRequest.setBaseDifficulty(3);
        typeRequest.setAvgTimeSeconds(120); 
        typeRequest.setParameterRanges("{\"cardCount\": [2, 20], \"displaySpeed\": [0.5, 3.0], \"timePerQuestion\": [2, 20]}");

        String typeResponse = mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(typeRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseTypeResponse exerciseType = objectMapper.readValue(typeResponse, ExerciseTypeResponse.class);

        CreateExerciseRequest exerciseRequest = new CreateExerciseRequest();
        exerciseRequest.setExerciseTypeId(exerciseType.getId());
        exerciseRequest.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        exerciseRequest.setDifficulty(3);
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
        request.setStartedAt(ZonedDateTime.now());
        request.setSettings("{\"cardCount\": 5, \"displaySpeed\": 1.0}");
        request.setScore(0);
        request.setTotalAttempts(0L);
        request.setTotalCorrect(0L);

        mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.studentId").value(studentId.toString()))
                .andExpect(jsonPath("$.exerciseId").value(exerciseId.toString()))
                .andExpect(jsonPath("$.totalAttempts").value(0))
                .andExpect(jsonPath("$.totalCorrect").value(0));
    }

    @Test
    void updateExerciseAttempt_ShouldReturnUpdatedAttempt() throws Exception {
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setStartedAt(ZonedDateTime.now());
        createRequest.setSettings("{\"cardCount\": 5}");
        createRequest.setScore(0);
        createRequest.setTotalAttempts(0L);
        createRequest.setTotalCorrect(0L);

        String createResponse = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResponse, ExerciseAttemptResponse.class);

        UpdateExerciseAttemptRequest updateRequest = new UpdateExerciseAttemptRequest();
        updateRequest.setScore(90);
        updateRequest.setTotalAttempts(100L);
        updateRequest.setTotalCorrect(95L);
        updateRequest.setCompletedAt(ZonedDateTime.now());

        mockMvc.perform(put("/api/exercise-attempts/{attemptId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score").value(90))
                .andExpect(jsonPath("$.totalAttempts").value(100))
                .andExpect(jsonPath("$.totalCorrect").value(95))
                .andExpect(jsonPath("$.completedAt").exists());
    }

    @Test
    void getExerciseAttemptById_ShouldReturnAttempt() throws Exception {
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setStartedAt(ZonedDateTime.now());
        createRequest.setSettings("{\"cardCount\": 5}");
        createRequest.setScore(0);
        createRequest.setTotalAttempts(0L);
        createRequest.setTotalCorrect(0L);

        String createResp = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResp, ExerciseAttemptResponse.class);

        UpdateExerciseAttemptRequest finish = new UpdateExerciseAttemptRequest();
        finish.setScore(85);
        finish.setTotalAttempts(10L);
        finish.setTotalCorrect(9L);
        finish.setCompletedAt(ZonedDateTime.now());

        mockMvc.perform(put("/api/exercise-attempts/{attemptId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(finish)))
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(get("/api/exercise-attempts/{attemptId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.totalAttempts").value(10))
                .andExpect(jsonPath("$.totalCorrect").value(9));
    }

    @Test
    void getAllExerciseAttempts_ShouldReturnListOfAttempts() throws Exception {
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setStartedAt(ZonedDateTime.now());
        createRequest.setSettings("{\"cardCount\": 5}");
        createRequest.setScore(0);
        createRequest.setTotalAttempts(0L);
        createRequest.setTotalCorrect(0L);

        String createResp = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResp, ExerciseAttemptResponse.class);

        UpdateExerciseAttemptRequest finish = new UpdateExerciseAttemptRequest();
        finish.setScore(85);
        finish.setTotalAttempts(5L);
        finish.setTotalCorrect(5L);
        finish.setCompletedAt(ZonedDateTime.now());

        mockMvc.perform(put("/api/exercise-attempts/{attemptId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(finish)))
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(get("/api/exercise-attempts"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists());
    }

    @Test
    void getExerciseAttemptsByStudent_ShouldReturnListOfAttempts() throws Exception {
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setStartedAt(ZonedDateTime.now());
        createRequest.setSettings("{\"cardCount\": 5}");
        createRequest.setScore(0);
        createRequest.setTotalAttempts(0L);
        createRequest.setTotalCorrect(0L);

        String createResp = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResp, ExerciseAttemptResponse.class);

        UpdateExerciseAttemptRequest finish = new UpdateExerciseAttemptRequest();
        finish.setScore(85);
        finish.setTotalAttempts(10L);
        finish.setTotalCorrect(9L);
        finish.setCompletedAt(ZonedDateTime.now());

        mockMvc.perform(put("/api/exercise-attempts/{attemptId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(finish)))
                .andReturn().getResponse().getContentAsString();

        mockMvc.perform(get("/api/exercise-attempts/student/{studentId}", studentId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].studentId").value(studentId.toString()));
    }

    @Test
    void deleteExerciseAttempt_ShouldReturnNoContent() throws Exception {
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setStartedAt(ZonedDateTime.now());
        createRequest.setSettings("{\"cardCount\": 5}");
        createRequest.setScore(0);
        createRequest.setTotalAttempts(0L);
        createRequest.setTotalCorrect(0L);

        String createResponse = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResponse, ExerciseAttemptResponse.class);

        mockMvc.perform(delete("/api/exercise-attempts/{attemptId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    void createExerciseAttempt_WithInvalidTotals_ShouldReturnBadRequest() throws Exception {
        CreateExerciseAttemptRequest createRequest = new CreateExerciseAttemptRequest();
        createRequest.setStudentId(studentId);
        createRequest.setExerciseId(exerciseId);
        createRequest.setStartedAt(ZonedDateTime.now());
        createRequest.setSettings("{\"cardCount\": 5}");
        createRequest.setScore(85);
        createRequest.setTotalAttempts(5L);
        createRequest.setTotalCorrect(2L);

        String createResponse = mockMvc.perform(post("/api/exercise-attempts")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseAttemptResponse created = objectMapper.readValue(createResponse, ExerciseAttemptResponse.class);

        UpdateExerciseAttemptRequest update = new UpdateExerciseAttemptRequest();
        update.setScore(85);
        update.setTotalAttempts(-5L); 
        update.setTotalCorrect(2L);

        mockMvc.perform(put("/api/exercise-attempts/{attemptId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
