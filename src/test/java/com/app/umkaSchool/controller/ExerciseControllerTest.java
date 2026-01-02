package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercise.UpdateExerciseRequest;
import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.ExerciseTypeRepository;
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

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@org.springframework.test.context.ActiveProfiles("test")
@Transactional
@WithMockUser(roles = "TEACHER")
class ExerciseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    private UUID exerciseTypeId;

    @BeforeEach
    void setup() throws Exception {
        CreateExerciseTypeRequest typeRequest = new CreateExerciseTypeRequest();
        typeRequest.setName("Test Exercise Type");
        typeRequest.setDescription("Test description");
        typeRequest.setBaseDifficulty(3);
        typeRequest.setAvgTimeSeconds(120);

        String response = mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(typeRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseTypeResponse typeResponse = objectMapper.readValue(response, ExerciseTypeResponse.class);
        exerciseTypeId = typeResponse.getId();
    }

    @AfterEach
    void cleanup() {
        exerciseRepository.deleteAll();
        exerciseTypeRepository.deleteAll();
    }

    @Test
    void createExercise_ShouldReturnCreatedExercise() throws Exception {
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setExerciseTypeId(exerciseTypeId);
        request.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        request.setDifficulty(3);
        request.setPoints(10);

        mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exerciseTypeId").value(exerciseTypeId.toString()))
                .andExpect(jsonPath("$.difficulty").value(3))
                .andExpect(jsonPath("$.points").value(10));
    }

    @Test
    void updateExercise_ShouldReturnUpdatedExercise() throws Exception {
        CreateExerciseRequest createRequest = new CreateExerciseRequest();
        createRequest.setExerciseTypeId(exerciseTypeId);
        createRequest.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        createRequest.setDifficulty(3);
        createRequest.setPoints(10);

        String createResponse = mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseResponse created = objectMapper.readValue(createResponse, ExerciseResponse.class);

        UpdateExerciseRequest updateRequest = new UpdateExerciseRequest();
        updateRequest.setDifficulty(5);
        updateRequest.setPoints(20);

        mockMvc.perform(put("/api/exercises/{exerciseId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.difficulty").value(5))
                .andExpect(jsonPath("$.points").value(20));
    }

    @Test
    void getExerciseById_ShouldReturnExercise() throws Exception {
        CreateExerciseRequest createRequest = new CreateExerciseRequest();
        createRequest.setExerciseTypeId(exerciseTypeId);
        createRequest.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        createRequest.setDifficulty(3);
        createRequest.setPoints(10);

        String createResponse = mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseResponse created = objectMapper.readValue(createResponse, ExerciseResponse.class);

        mockMvc.perform(get("/api/exercises/{exerciseId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.difficulty").value(3));
    }

    @Test
    void getAllExercises_ShouldReturnListOfExercises() throws Exception {
        CreateExerciseRequest createRequest = new CreateExerciseRequest();
        createRequest.setExerciseTypeId(exerciseTypeId);
        createRequest.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        createRequest.setDifficulty(3);
        createRequest.setPoints(10);

        mockMvc.perform(post("/api/exercises")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        mockMvc.perform(get("/api/exercises?page=0&size=20"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].difficulty").value(3))
                .andExpect(jsonPath("$.content[0].points").value(10))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.totalPages").value(1));
    }

    @Test
    void getExercisesByType_ShouldReturnListOfExercises() throws Exception {
        CreateExerciseRequest createRequest = new CreateExerciseRequest();
        createRequest.setExerciseTypeId(exerciseTypeId);
        createRequest.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        createRequest.setDifficulty(3);
        createRequest.setPoints(10);

        mockMvc.perform(post("/api/exercises")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        mockMvc.perform(get("/api/exercises/type/{exerciseTypeId}?page=0&size=20", exerciseTypeId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].exerciseTypeId").value(exerciseTypeId.toString()))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void getExercisesByDifficulty_ShouldReturnListOfExercises() throws Exception {
        CreateExerciseRequest createRequest = new CreateExerciseRequest();
        createRequest.setExerciseTypeId(exerciseTypeId);
        createRequest.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        createRequest.setDifficulty(5);
        createRequest.setPoints(10);

        mockMvc.perform(post("/api/exercises")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        mockMvc.perform(get("/api/exercises/difficulty/{difficulty}?page=0&size=20", 5))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].difficulty").value(5))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void deleteExercise_ShouldReturnNoContent() throws Exception {
        CreateExerciseRequest createRequest = new CreateExerciseRequest();
        createRequest.setExerciseTypeId(exerciseTypeId);
        createRequest.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        createRequest.setDifficulty(3);
        createRequest.setPoints(10);

        String createResponse = mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseResponse created = objectMapper.readValue(createResponse, ExerciseResponse.class);

        mockMvc.perform(delete("/api/exercises/{exerciseId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    void createExercise_WithInvalidDifficulty_ShouldReturnBadRequest() throws Exception {
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setExerciseTypeId(exerciseTypeId);
        request.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        request.setDifficulty(15); 
        request.setPoints(10);

        mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createExercise_WithInvalidExerciseTypeId_ShouldReturnNotFound() throws Exception {
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setExerciseTypeId(UUID.randomUUID()); 
        request.setParameters("{\"operand1\": 5, \"operand2\": 3}");
        request.setDifficulty(3);
        request.setPoints(10);

        mockMvc.perform(post("/api/exercises")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}


