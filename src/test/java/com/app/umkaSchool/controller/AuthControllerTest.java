package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.repository.AppUserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Откатывает изменения после каждого теста
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @BeforeEach
    void setUp() {
        // Очистка данных перед каждым тестом (опционально)
        // appUserRepository.deleteAll();
    }

    @Test
    void testSignup_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Иван");
        request.setLastName("Иванов");
        request.setEmail("ivan.test@example.com");
        request.setPassword("password123");
        request.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print()) // Выводит детали запроса и ответа
                .andExpect(status().isOk());
    }

    @Test
    void testSignup_InvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Иван");
        request.setLastName("Иванов");
        request.setEmail("invalid-email"); // Невалидный email
        request.setPassword("password123");
        request.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignup_ShortPassword() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setFirstName("Иван");
        request.setLastName("Иванов");
        request.setEmail("ivan.test2@example.com");
        request.setPassword("12345"); // Слишком короткий пароль (минимум 6 символов)
        request.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignup_MissingFields() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        // firstName, lastName, password, role отсутствуют

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }

    @Test
    void testSignup_DuplicateEmail() throws Exception {
        // Первая регистрация
        RegisterRequest request1 = new RegisterRequest();
        request1.setFirstName("Петр");
        request1.setLastName("Петров");
        request1.setEmail("duplicate@example.com");
        request1.setPassword("password123");
        request1.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        // Попытка зарегистрироваться с тем же email
        RegisterRequest request2 = new RegisterRequest();
        request2.setFirstName("Анна");
        request2.setLastName("Сидорова");
        request2.setEmail("duplicate@example.com"); // Тот же email
        request2.setPassword("password456");
        request2.setRole("TEACHER");

        // Используем assertThrows для проверки, что выбрасывается исключение
        org.junit.jupiter.api.Assertions.assertThrows(Exception.class, () -> {
            mockMvc.perform(post("/api/auth/signup")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(request2)));
        });
    }
}
