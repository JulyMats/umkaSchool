package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.group.CreateGroupRequest;
import com.app.umkaSchool.dto.group.GroupResponse;
import com.app.umkaSchool.dto.group.UpdateGroupRequest;
import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.dto.teacher.TeacherResponse;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.StudentGroupRepository;
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
class GroupControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private StudentGroupRepository groupRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private AppUserRepository appUserRepository;

    @AfterEach
    void cleanup() {
        groupRepository.deleteAll();
        teacherRepository.deleteAll();
        appUserRepository.deleteAll();
    }

    private TeacherResponse createTestTeacher(String email) throws Exception {
        // First, create user via signup
        RegisterRequest signupRequest = new RegisterRequest();
        signupRequest.setEmail(email);
        signupRequest.setFirstName("Test");
        signupRequest.setLastName("Teacher");
        signupRequest.setPassword("password123");
        signupRequest.setRole("TEACHER");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk());

        // Then create teacher profile
        CreateTeacherRequest teacherRequest = new CreateTeacherRequest();
        teacherRequest.setFirstName("Test");
        teacherRequest.setLastName("Teacher");
        teacherRequest.setEmail(email);
        teacherRequest.setBio("Test teacher");
        teacherRequest.setPhone("+1234567890");

        String response = mockMvc.perform(post("/api/teachers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(teacherRequest)))
                .andReturn().getResponse().getContentAsString();

        return objectMapper.readValue(response, TeacherResponse.class);
    }

    @Test
    void createGroup_ShouldReturnCreatedGroup() throws Exception {
        TeacherResponse teacher = createTestTeacher("teacher.create@test.com");

        CreateGroupRequest request = new CreateGroupRequest();
        request.setName("Math Group A");
        request.setCode("MATH1");
        request.setDescription("Advanced math group");
        request.setTeacherId(teacher.getId());

        mockMvc.perform(post("/api/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Math Group A"))
                .andExpect(jsonPath("$.code").value("MATH1"))
                .andExpect(jsonPath("$.description").value("Advanced math group"));
    }

    @Test
    void updateGroup_ShouldReturnUpdatedGroup() throws Exception {
        TeacherResponse teacher = createTestTeacher("teacher.update@test.com");

        // Create group first
        CreateGroupRequest createRequest = new CreateGroupRequest();
        createRequest.setName("Math Group A");
        createRequest.setCode("MATH2");
        createRequest.setDescription("Math group");
        createRequest.setTeacherId(teacher.getId());

        String createResponse = mockMvc.perform(post("/api/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        GroupResponse created = objectMapper.readValue(createResponse, GroupResponse.class);

        // Update group
        UpdateGroupRequest updateRequest = new UpdateGroupRequest();
        updateRequest.setName("Math Group A Updated");
        updateRequest.setDescription("Updated description");

        mockMvc.perform(put("/api/groups/{groupId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Math Group A Updated"))
                .andExpect(jsonPath("$.description").value("Updated description"));
    }

    @Test
    void getGroupById_ShouldReturnGroup() throws Exception {
        TeacherResponse teacher = createTestTeacher("teacher.get@test.com");

        // Create group first
        CreateGroupRequest createRequest = new CreateGroupRequest();
        createRequest.setName("Math Group A");
        createRequest.setCode("MATH3");
        createRequest.setDescription("Math group");
        createRequest.setTeacherId(teacher.getId());

        String createResponse = mockMvc.perform(post("/api/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        GroupResponse created = objectMapper.readValue(createResponse, GroupResponse.class);

        // Get group by ID
        mockMvc.perform(get("/api/groups/{groupId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.name").value("Math Group A"));
    }

    @Test
    void getGroupByCode_ShouldReturnGroup() throws Exception {
        TeacherResponse teacher = createTestTeacher("teacher.getcode@test.com");

        // Create group first
        CreateGroupRequest createRequest = new CreateGroupRequest();
        createRequest.setName("Math Group A");
        createRequest.setCode("MATH4");
        createRequest.setDescription("Math group");
        createRequest.setTeacherId(teacher.getId());

        mockMvc.perform(post("/api/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get group by code
        mockMvc.perform(get("/api/groups/code/{code}", "MATH4"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("MATH4"));
    }

    @Test
    void getAllGroups_ShouldReturnListOfGroups() throws Exception {
        TeacherResponse teacher = createTestTeacher("teacher.all@test.com");

        // Create a group
        CreateGroupRequest createRequest = new CreateGroupRequest();
        createRequest.setName("Math Group A");
        createRequest.setCode("MATH5");
        createRequest.setDescription("Math group");
        createRequest.setTeacherId(teacher.getId());

        mockMvc.perform(post("/api/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get all groups
        mockMvc.perform(get("/api/groups"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Math Group A"));
    }

    @Test
    void deleteGroup_ShouldReturnNoContent() throws Exception {
        TeacherResponse teacher = createTestTeacher("teacher.delete@test.com");

        // Create group first
        CreateGroupRequest createRequest = new CreateGroupRequest();
        createRequest.setName("Math Group A");
        createRequest.setCode("MATH6");
        createRequest.setDescription("Math group");
        createRequest.setTeacherId(teacher.getId());

        String createResponse = mockMvc.perform(post("/api/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        GroupResponse created = objectMapper.readValue(createResponse, GroupResponse.class);

        // Delete group
        mockMvc.perform(delete("/api/groups/{groupId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }
}
