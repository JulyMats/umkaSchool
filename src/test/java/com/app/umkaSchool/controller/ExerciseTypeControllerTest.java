package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
import com.app.umkaSchool.dto.exercisetype.UpdateExerciseTypeRequest;
import com.app.umkaSchool.repository.ExerciseTypeRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(roles = "TEACHER")
class ExerciseTypeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    @AfterEach
    void cleanup() {
        exerciseTypeRepository.deleteAll();
    }

    @Test
    void createExerciseType_ShouldReturnCreatedExerciseType() throws Exception {
        CreateExerciseTypeRequest request = new CreateExerciseTypeRequest();
        request.setName("Arithmetic Addition");
        request.setDescription("Basic addition exercises");
        request.setBaseDifficulty(3);
        request.setAvgTimeSeconds(120);

        mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Arithmetic Addition"))
                .andExpect(jsonPath("$.description").value("Basic addition exercises"))
                .andExpect(jsonPath("$.baseDifficulty").value(3))
                .andExpect(jsonPath("$.avgTimeSeconds").value(120));
    }

    @Test
    void updateExerciseType_ShouldReturnUpdatedExerciseType() throws Exception {
        // Create exercise type first
        CreateExerciseTypeRequest createRequest = new CreateExerciseTypeRequest();
        createRequest.setName("Arithmetic Update");
        createRequest.setDescription("Update test");
        createRequest.setBaseDifficulty(3);
        createRequest.setAvgTimeSeconds(120);

        String createResponse = mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseTypeResponse created = objectMapper.readValue(createResponse, ExerciseTypeResponse.class);

        // Update exercise type
        UpdateExerciseTypeRequest updateRequest = new UpdateExerciseTypeRequest();
        updateRequest.setDescription("Updated description");
        updateRequest.setBaseDifficulty(5);

        mockMvc.perform(put("/api/exercise-types/{exerciseTypeId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated description"))
                .andExpect(jsonPath("$.baseDifficulty").value(5));
    }

    @Test
    void getExerciseTypeById_ShouldReturnExerciseType() throws Exception {
        // Create exercise type first
        CreateExerciseTypeRequest createRequest = new CreateExerciseTypeRequest();
        createRequest.setName("Arithmetic Get");
        createRequest.setDescription("Get test");
        createRequest.setBaseDifficulty(3);
        createRequest.setAvgTimeSeconds(120);

        String createResponse = mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseTypeResponse created = objectMapper.readValue(createResponse, ExerciseTypeResponse.class);

        // Get exercise type by ID
        mockMvc.perform(get("/api/exercise-types/{exerciseTypeId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.name").value("Arithmetic Get"));
    }

    @Test
    void getExerciseTypeByName_ShouldReturnExerciseType() throws Exception {
        // Create exercise type first
        CreateExerciseTypeRequest createRequest = new CreateExerciseTypeRequest();
        createRequest.setName("Arithmetic ByName");
        createRequest.setDescription("ByName test");
        createRequest.setBaseDifficulty(3);
        createRequest.setAvgTimeSeconds(120);

        mockMvc.perform(post("/api/exercise-types")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get exercise type by name
        mockMvc.perform(get("/api/exercise-types/name/{name}", "Arithmetic ByName"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Arithmetic ByName"));
    }

    @Test
    void getAllExerciseTypes_ShouldReturnListOfExerciseTypes() throws Exception {
        // Create an exercise type
        CreateExerciseTypeRequest createRequest = new CreateExerciseTypeRequest();
        createRequest.setName("Arithmetic All");
        createRequest.setDescription("All test");
        createRequest.setBaseDifficulty(3);
        createRequest.setAvgTimeSeconds(120);

        mockMvc.perform(post("/api/exercise-types")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get all exercise types
        mockMvc.perform(get("/api/exercise-types"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Arithmetic All"));
    }

    @Test
    void deleteExerciseType_ShouldReturnNoContent() throws Exception {
        // Create exercise type first
        CreateExerciseTypeRequest createRequest = new CreateExerciseTypeRequest();
        createRequest.setName("Arithmetic Delete");
        createRequest.setDescription("Delete test");
        createRequest.setBaseDifficulty(3);
        createRequest.setAvgTimeSeconds(120);

        String createResponse = mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        ExerciseTypeResponse created = objectMapper.readValue(createResponse, ExerciseTypeResponse.class);

        // Delete exercise type
        mockMvc.perform(delete("/api/exercise-types/{exerciseTypeId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    void createExerciseType_WithInvalidDifficulty_ShouldReturnBadRequest() throws Exception {
        CreateExerciseTypeRequest request = new CreateExerciseTypeRequest();
        request.setName("Arithmetic Invalid");
        request.setDescription("Invalid test");
        request.setBaseDifficulty(15); // Invalid: must be between 1 and 10
        request.setAvgTimeSeconds(120);

        mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createExerciseType_WithDuplicateName_ShouldReturnBadRequest() throws Exception {
        // Create first exercise type
        CreateExerciseTypeRequest request1 = new CreateExerciseTypeRequest();
        request1.setName("Duplicate Name");
        request1.setDescription("First");
        request1.setBaseDifficulty(3);
        request1.setAvgTimeSeconds(120);

        mockMvc.perform(post("/api/exercise-types")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)));

        // Try to create second exercise type with same name
        CreateExerciseTypeRequest request2 = new CreateExerciseTypeRequest();
        request2.setName("Duplicate Name");
        request2.setDescription("Second");
        request2.setBaseDifficulty(5);
        request2.setAvgTimeSeconds(180);

        mockMvc.perform(post("/api/exercise-types")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}