package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.ForgotPasswordRequest;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.auth.ResetPasswordRequest;
import com.app.umkaSchool.model.UserToken;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.UserTokenRepository;
import com.app.umkaSchool.service.TokenService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional // Rollback changes after each test
class PasswordResetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private AppUserRepository appUserRepository;

    @Autowired
    private UserTokenRepository userTokenRepository;

    @Autowired
    private TokenService tokenService;

    private String testEmail = "reset.test@example.com";
    private String testPassword = "oldpassword123";

    @BeforeEach
    void setUp() throws Exception {
        // Create test user before each test
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");
        registerRequest.setEmail(testEmail);
        registerRequest.setPassword(testPassword);
        registerRequest.setRole("STUDENT");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)));
    }

    // ==================== FORGOT PASSWORD TESTS ====================

    @Test
    void testForgotPassword_Success() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(testEmail);

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk());

        // Verify that token was created in DB
        var tokens = userTokenRepository.findAll();
        var passwordResetTokens = tokens.stream()
                .filter(t -> t.getTokenType() == UserToken.TokenType.PASSWORD_RESET)
                .filter(t -> !t.getUsed())
                .count();

        assert passwordResetTokens > 0 : "Password reset token should be created";
    }

    @Test
    void testForgotPassword_NonExistentEmail() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("nonexistent@example.com");

        // Even for non-existent email return 200 (don't reveal user existence)
        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk());
    }

    @Test
    void testForgotPassword_InvalidEmail() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("invalid-email");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Validation should reject
    }

    @Test
    void testForgotPassword_EmptyEmail() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Validation should reject
    }

    // ==================== RESET PASSWORD TESTS ====================

    @Test
    void testResetPassword_Success() throws Exception {
        // First create password reset token
        String rawToken = createPasswordResetToken(testEmail);

        // Now reset password
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(rawToken);
        request.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk());

        // Verify that token is marked as used
        String hash = tokenService.hashToken(rawToken);
        Optional<UserToken> tokenOpt = userTokenRepository.findByTokenHashAndTokenType(
                hash,
                UserToken.TokenType.PASSWORD_RESET
        );
        assert tokenOpt.isPresent() : "Token should exist";
        assert tokenOpt.get().getUsed() : "Token should be marked as used";
    }

    @Test
    void testResetPassword_InvalidToken() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("invalid-token-xyz");
        request.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Token not found
    }

    @Test
    void testResetPassword_ExpiredToken() throws Exception {
        // Create token that has already expired
        String rawToken = createExpiredPasswordResetToken(testEmail);

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(rawToken);
        request.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Token expired
    }

    @Test
    void testResetPassword_AlreadyUsedToken() throws Exception {
        // Create token
        String rawToken = createPasswordResetToken(testEmail);

        // Use token first time
        ResetPasswordRequest request1 = new ResetPasswordRequest();
        request1.setToken(rawToken);
        request1.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        // Try to use the same token again
        ResetPasswordRequest request2 = new ResetPasswordRequest();
        request2.setToken(rawToken);
        request2.setNewPassword("anotherpassword456");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Token already used
    }

    @Test
    void testResetPassword_ShortPassword() throws Exception {
        String rawToken = createPasswordResetToken(testEmail);

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(rawToken);
        request.setNewPassword("12345"); // Less than 6 characters

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Validation should reject
    }

    @Test
    void testResetPassword_EmptyToken() throws Exception {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("");
        request.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Validation should reject
    }

    @Test
    void testResetPassword_EmptyPassword() throws Exception {
        String rawToken = createPasswordResetToken(testEmail);

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(rawToken);
        request.setNewPassword("");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); // Validation should reject
    }

    // ==================== HELPER METHODS ====================

    /**
     * Creates valid password reset token
     */
    private String createPasswordResetToken(String email) {
        var user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String rawToken = tokenService.generateToken();
        String hash = tokenService.hashToken(rawToken);

        UserToken token = new UserToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setTokenType(UserToken.TokenType.PASSWORD_RESET);
        token.setCreatedAt(ZonedDateTime.now());
        token.setExpiresAt(ZonedDateTime.now().plusHours(2));
        token.setUsed(false);
        userTokenRepository.save(token);

        return rawToken;
    }

    /**
     * Creates expired password reset token
     */
    private String createExpiredPasswordResetToken(String email) {
        var user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String rawToken = tokenService.generateToken();
        String hash = tokenService.hashToken(rawToken);

        UserToken token = new UserToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setTokenType(UserToken.TokenType.PASSWORD_RESET);
        token.setCreatedAt(ZonedDateTime.now().minusHours(3)); // 3 hours ago
        token.setExpiresAt(ZonedDateTime.now().minusHours(1)); // Expired 1 hour ago
        token.setUsed(false);
        userTokenRepository.save(token);

        return rawToken;
    }
}
