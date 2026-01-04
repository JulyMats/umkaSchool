package com.app.umkaSchool.controller;

import com.app.umkaSchool.config.TestContainersConfiguration;
import com.app.umkaSchool.dto.dailychallenge.CreateDailyChallengeRequest;
import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
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
import java.util.Collections;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
@WithMockUser(username = "testuser", roles = {"STUDENT"})
class DailyChallengeControllerTest extends TestContainersConfiguration {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private UUID exerciseId;

    @BeforeEach
    void setUp() throws Exception {
        CreateExerciseTypeRequest typeRequest = new CreateExerciseTypeRequest();
        typeRequest.setName("Test Challenge Type");
        typeRequest.setDescription("Test description");
        typeRequest.setBaseDifficulty(3);
        typeRequest.setAvgTimeSeconds(120);

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

        CreateDailyChallengeRequest challengeRequest = new CreateDailyChallengeRequest();
        challengeRequest.setChallengeDate(LocalDate.now());
        challengeRequest.setTitle("Test Challenge");
        challengeRequest.setDescription("Test Description");
        CreateDailyChallengeRequest.ExerciseRequest exerciseReq = new CreateDailyChallengeRequest.ExerciseRequest();
        exerciseReq.setExerciseId(exerciseId);
        exerciseReq.setOrderIndex(0);
        challengeRequest.setExercises(Collections.singletonList(exerciseReq));

        mockMvc.perform(post("/api/daily-challenges")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(challengeRequest)))
                .andExpect(status().isCreated());
    }

    @Test
    void getAllDailyChallenges_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/daily-challenges")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getTodayChallenge_ShouldReturnChallenge() throws Exception {
        mockMvc.perform(get("/api/daily-challenges/today")
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void getDailyChallengeByDate_ShouldReturnChallenge() throws Exception {
        LocalDate date = LocalDate.now();
        mockMvc.perform(get("/api/daily-challenges/date/" + date)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void getDailyChallengeById_WithInvalidId_ShouldReturnNotFound() throws Exception {
        UUID invalidId = UUID.randomUUID();
        mockMvc.perform(get("/api/daily-challenges/" + invalidId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andDo(print())
                .andExpect(status().isNotFound());
    }
}

