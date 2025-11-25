package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
import com.app.umkaSchool.dto.homework.CreateHomeworkRequest;
import com.app.umkaSchool.dto.homework.HomeworkResponse;
import com.app.umkaSchool.dto.homework.UpdateHomeworkRequest;
import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.dto.teacher.TeacherResponse;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.ExerciseTypeRepository;
import com.app.umkaSchool.repository.HomeworkRepository;
import com.app.umkaSchool.repository.TeacherRepository;
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

import java.util.Arrays;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@WithMockUser(roles = "TEACHER")
class HomeworkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private HomeworkRepository homeworkRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private ExerciseRepository exerciseRepository;

    @Autowired
    private ExerciseTypeRepository exerciseTypeRepository;

    private UUID teacherId;
    private UUID exerciseId;

    @BeforeEach
    void setup() throws Exception {
        // First, create user via signup
        RegisterRequest signupRequest = new RegisterRequest();
        signupRequest.setEmail("test.homework.teacher@test.com");
        signupRequest.setFirstName("Test");
        signupRequest.setLastName("Teacher");
        signupRequest.setPassword("password123");
        signupRequest.setRole("TEACHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Create a teacher
        CreateTeacherRequest teacherRequest = new CreateTeacherRequest();
        teacherRequest.setFirstName("Test");
        teacherRequest.setLastName("Teacher");
        teacherRequest.setEmail("test.homework.teacher@test.com");
        teacherRequest.setBio("Test teacher");
        teacherRequest.setPhone("+1234567890");

        String teacherResponse = mockMvc.perform(post("/api/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(teacherRequest)))
                .andReturn().getResponse().getContentAsString();

        TeacherResponse teacher = objectMapper.readValue(teacherResponse, TeacherResponse.class);
        teacherId = teacher.getId();

        // Create an exercise type
        CreateExerciseTypeRequest typeRequest = new CreateExerciseTypeRequest();
        typeRequest.setName("Homework Exercise Type");
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
        homeworkRepository.deleteAll();
        exerciseRepository.deleteAll();
        exerciseTypeRepository.deleteAll();
        teacherRepository.deleteAll();
        appUserRepository.deleteAll();
    }

    @Test
    void createHomework_ShouldReturnCreatedHomework() throws Exception {
        CreateHomeworkRequest request = new CreateHomeworkRequest();
        request.setTitle("Math Homework 1");
        request.setDescription("Basic arithmetic exercises");
        request.setTeacherId(teacherId);
        request.setExerciseIds(Arrays.asList(exerciseId));

        mockMvc.perform(post("/api/homework")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Math Homework 1"))
                .andExpect(jsonPath("$.description").value("Basic arithmetic exercises"))
                .andExpect(jsonPath("$.teacherId").value(teacherId.toString()));
    }

    @Test
    void updateHomework_ShouldReturnUpdatedHomework() throws Exception {
        // Create homework first
        CreateHomeworkRequest createRequest = new CreateHomeworkRequest();
        createRequest.setTitle("Math Homework Update");
        createRequest.setDescription("Original description");
        createRequest.setTeacherId(teacherId);

        String createResponse = mockMvc.perform(post("/api/homework")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        HomeworkResponse created = objectMapper.readValue(createResponse, HomeworkResponse.class);

        // Update homework
        UpdateHomeworkRequest updateRequest = new UpdateHomeworkRequest();
        updateRequest.setDescription("Updated description");

        mockMvc.perform(put("/api/homework/{homeworkId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Updated description"));
    }

    @Test
    void getHomeworkById_ShouldReturnHomework() throws Exception {
        // Create homework first
        CreateHomeworkRequest createRequest = new CreateHomeworkRequest();
        createRequest.setTitle("Math Homework Get");
        createRequest.setDescription("Get test");
        createRequest.setTeacherId(teacherId);

        String createResponse = mockMvc.perform(post("/api/homework")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        HomeworkResponse created = objectMapper.readValue(createResponse, HomeworkResponse.class);

        // Get homework by ID
        mockMvc.perform(get("/api/homework/{homeworkId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.title").value("Math Homework Get"));
    }

    @Test
    void getHomeworkByTitle_ShouldReturnHomework() throws Exception {
        // Create homework first
        CreateHomeworkRequest createRequest = new CreateHomeworkRequest();
        createRequest.setTitle("Math Homework ByTitle");
        createRequest.setDescription("ByTitle test");
        createRequest.setTeacherId(teacherId);

        mockMvc.perform(post("/api/homework")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get homework by title
        mockMvc.perform(get("/api/homework/title/{title}", "Math Homework ByTitle"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Math Homework ByTitle"));
    }

    @Test
    void getAllHomework_ShouldReturnListOfHomework() throws Exception {
        // Create homework
        CreateHomeworkRequest createRequest = new CreateHomeworkRequest();
        createRequest.setTitle("Math Homework All");
        createRequest.setDescription("All test");
        createRequest.setTeacherId(teacherId);

        mockMvc.perform(post("/api/homework")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get all homework
        mockMvc.perform(get("/api/homework"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Math Homework All"));
    }

    @Test
    void getHomeworkByTeacher_ShouldReturnListOfHomework() throws Exception {
        // Create homework
        CreateHomeworkRequest createRequest = new CreateHomeworkRequest();
        createRequest.setTitle("Math Homework Teacher");
        createRequest.setDescription("Teacher test");
        createRequest.setTeacherId(teacherId);

        mockMvc.perform(post("/api/homework")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get homework by teacher
        mockMvc.perform(get("/api/homework/teacher/{teacherId}", teacherId))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].teacherId").value(teacherId.toString()));
    }

    @Test
    void deleteHomework_ShouldReturnNoContent() throws Exception {
        // Create homework first
        CreateHomeworkRequest createRequest = new CreateHomeworkRequest();
        createRequest.setTitle("Math Homework Delete");
        createRequest.setDescription("Delete test");
        createRequest.setTeacherId(teacherId);

        String createResponse = mockMvc.perform(post("/api/homework")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        HomeworkResponse created = objectMapper.readValue(createResponse, HomeworkResponse.class);

        // Delete homework
        mockMvc.perform(delete("/api/homework/{homeworkId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    void createHomework_WithDuplicateTitle_ShouldReturnBadRequest() throws Exception {
        // Create first homework
        CreateHomeworkRequest request1 = new CreateHomeworkRequest();
        request1.setTitle("Duplicate Homework");
        request1.setDescription("First");
        request1.setTeacherId(teacherId);

        mockMvc.perform(post("/api/homework")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)));

        // Try to create second homework with same title
        CreateHomeworkRequest request2 = new CreateHomeworkRequest();
        request2.setTitle("Duplicate Homework");
        request2.setDescription("Second");
        request2.setTeacherId(teacherId);

        mockMvc.perform(post("/api/homework")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
