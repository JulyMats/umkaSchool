package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.guardian.CreateGuardianRequest;
import com.app.umkaSchool.dto.guardian.GuardianResponse;
import com.app.umkaSchool.dto.guardian.UpdateGuardianRequest;
import com.app.umkaSchool.repository.GuardianRepository;
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
@WithMockUser(roles = "TEACHER")
class GuardianControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private GuardianRepository guardianRepository;

    @AfterEach
    void cleanup() {
        guardianRepository.deleteAll();
    }

    @Test
    void createGuardian_ShouldReturnCreatedGuardian() throws Exception {
        CreateGuardianRequest request = new CreateGuardianRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setEmail("jane.doe@test.com");
        request.setPhone("+1234567890");
        request.setRelationship("MOTHER");

        mockMvc.perform(post("/api/guardians")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.email").value("jane.doe@test.com"))
                .andExpect(jsonPath("$.phone").value("+1234567890"))
                .andExpect(jsonPath("$.relationship").value("MOTHER"));
    }

    @Test
    void updateGuardian_ShouldReturnUpdatedGuardian() throws Exception {
        // Create guardian first
        CreateGuardianRequest createRequest = new CreateGuardianRequest();
        createRequest.setFirstName("Jane");
        createRequest.setLastName("Doe");
        createRequest.setEmail("jane.update@test.com");
        createRequest.setPhone("+1234567890");
        createRequest.setRelationship("MOTHER");

        String createResponse = mockMvc.perform(post("/api/guardians")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        GuardianResponse created = objectMapper.readValue(createResponse, GuardianResponse.class);

        // Update guardian
        UpdateGuardianRequest updateRequest = new UpdateGuardianRequest();
        updateRequest.setFirstName("Jane Updated");
        updateRequest.setPhone("+9876543210");

        mockMvc.perform(put("/api/guardians/{guardianId}", created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jane Updated"))
                .andExpect(jsonPath("$.phone").value("+9876543210"));
    }

    @Test
    void getGuardianById_ShouldReturnGuardian() throws Exception {
        // Create guardian first
        CreateGuardianRequest createRequest = new CreateGuardianRequest();
        createRequest.setFirstName("Jane");
        createRequest.setLastName("Doe");
        createRequest.setEmail("jane.get@test.com");
        createRequest.setPhone("+1234567890");
        createRequest.setRelationship("MOTHER");

        String createResponse = mockMvc.perform(post("/api/guardians")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        GuardianResponse created = objectMapper.readValue(createResponse, GuardianResponse.class);

        // Get guardian by ID
        mockMvc.perform(get("/api/guardians/{guardianId}", created.getId()))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(created.getId().toString()))
                .andExpect(jsonPath("$.firstName").value("Jane"));
    }

    @Test
    void getGuardianByEmail_ShouldReturnGuardian() throws Exception {
        // Create guardian first
        CreateGuardianRequest createRequest = new CreateGuardianRequest();
        createRequest.setFirstName("Jane");
        createRequest.setLastName("Doe");
        createRequest.setEmail("jane.email@test.com");
        createRequest.setPhone("+1234567890");
        createRequest.setRelationship("MOTHER");

        mockMvc.perform(post("/api/guardians")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get guardian by email
        mockMvc.perform(get("/api/guardians/email/{email}", "jane.email@test.com"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("jane.email@test.com"))
                .andExpect(jsonPath("$.firstName").value("Jane"));
    }

    @Test
    void getAllGuardians_ShouldReturnListOfGuardians() throws Exception {
        // Create a guardian
        CreateGuardianRequest createRequest = new CreateGuardianRequest();
        createRequest.setFirstName("Jane");
        createRequest.setLastName("Doe");
        createRequest.setEmail("jane.all@test.com");
        createRequest.setPhone("+1234567890");
        createRequest.setRelationship("MOTHER");

        mockMvc.perform(post("/api/guardians")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createRequest)));

        // Get all guardians
        mockMvc.perform(get("/api/guardians"))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].firstName").value("Jane"))
                .andExpect(jsonPath("$[0].email").value("jane.all@test.com"));
    }

    @Test
    void deleteGuardian_ShouldReturnNoContent() throws Exception {
        // Create guardian first
        CreateGuardianRequest createRequest = new CreateGuardianRequest();
        createRequest.setFirstName("Jane");
        createRequest.setLastName("Doe");
        createRequest.setEmail("jane.delete@test.com");
        createRequest.setPhone("+1234567890");
        createRequest.setRelationship("MOTHER");

        String createResponse = mockMvc.perform(post("/api/guardians")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andReturn().getResponse().getContentAsString();

        GuardianResponse created = objectMapper.readValue(createResponse, GuardianResponse.class);

        // Delete guardian
        mockMvc.perform(delete("/api/guardians/{guardianId}", created.getId()))
                .andDo(print())
                .andExpect(status().isNoContent());
    }

    @Test
    void createGuardian_WithInvalidEmail_ShouldReturnBadRequest() throws Exception {
        CreateGuardianRequest request = new CreateGuardianRequest();
        request.setFirstName("Jane");
        request.setLastName("Doe");
        request.setEmail("invalid-email");
        request.setPhone("+1234567890");
        request.setRelationship("MOTHER");

        mockMvc.perform(post("/api/guardians")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void createGuardian_WithDuplicateEmail_ShouldReturnBadRequest() throws Exception {
        // Create first guardian
        CreateGuardianRequest request1 = new CreateGuardianRequest();
        request1.setFirstName("Jane");
        request1.setLastName("Doe");
        request1.setEmail("duplicate@test.com");
        request1.setPhone("+1234567890");
        request1.setRelationship("MOTHER");

        mockMvc.perform(post("/api/guardians")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request1)));

        // Try to create second guardian with same email
        CreateGuardianRequest request2 = new CreateGuardianRequest();
        request2.setFirstName("John");
        request2.setLastName("Smith");
        request2.setEmail("duplicate@test.com");
        request2.setPhone("+9876543210");
        request2.setRelationship("FATHER");

        mockMvc.perform(post("/api/guardians")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}

