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
@org.springframework.test.context.ActiveProfiles("test")
@Transactional 
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
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");
        registerRequest.setEmail(testEmail);
        registerRequest.setPassword(testPassword);
        registerRequest.setRole("STUDENT");
        registerRequest.setDateOfBirth(java.time.LocalDate.of(2010, 1, 1));
        registerRequest.setGuardianFirstName("Guardian");
        registerRequest.setGuardianLastName("Name");
        registerRequest.setGuardianEmail("guardian.reset@example.com");
        registerRequest.setGuardianPhone("123456789");
        registerRequest.setGuardianRelationship("MOTHER");

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk());
        
        
    }

    @Test
    void testForgotPassword_Success() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail(testEmail);

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk());

        var tokens = userTokenRepository.findAll();
        var passwordResetTokens = tokens.stream()
                .filter(t -> t.getTokenType() == UserToken.TokenType.PASSWORD_RESET)
                .filter(t -> !t.isUsed())
                .count();

        assert passwordResetTokens > 0 : "Password reset token should be created";
    }

    @Test
    void testForgotPassword_NonExistentEmail() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("nonexistent@example.com");

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
                .andExpect(status().isBadRequest()); 
    }

    @Test
    void testForgotPassword_EmptyEmail() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); 
    }

    @Test
    void testResetPassword_Success() throws Exception {
        String rawToken = createPasswordResetToken(testEmail);

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(rawToken);
        request.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk());

        String hash = tokenService.hashToken(rawToken);
        Optional<UserToken> tokenOpt = userTokenRepository.findByTokenHashAndTokenType(
                hash,
                UserToken.TokenType.PASSWORD_RESET
        );
        assert tokenOpt.isPresent() : "Token should exist";
        assert tokenOpt.get().isUsed() : "Token should be marked as used";
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
                .andExpect(status().isBadRequest()); 
    }

    @Test
    void testResetPassword_ExpiredToken() throws Exception {
        String rawToken = createExpiredPasswordResetToken(testEmail);

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(rawToken);
        request.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); 
    }

    @Test
    void testResetPassword_AlreadyUsedToken() throws Exception {
        String rawToken = createPasswordResetToken(testEmail);

        ResetPasswordRequest request1 = new ResetPasswordRequest();
        request1.setToken(rawToken);
        request1.setNewPassword("newpassword123");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk());

        ResetPasswordRequest request2 = new ResetPasswordRequest();
        request2.setToken(rawToken);
        request2.setNewPassword("anotherpassword456");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andDo(print())
                .andExpect(status().isBadRequest()); 
    }

    @Test
    void testResetPassword_ShortPassword() throws Exception {
        String rawToken = createPasswordResetToken(testEmail);

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken(rawToken);
        request.setNewPassword("12345"); 

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isBadRequest()); 
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
                .andExpect(status().isBadRequest()); 
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
                .andExpect(status().isBadRequest()); 
    }

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

    private String createExpiredPasswordResetToken(String email) {
        var user = appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String rawToken = tokenService.generateToken();
        String hash = tokenService.hashToken(rawToken);

        UserToken token = new UserToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setTokenType(UserToken.TokenType.PASSWORD_RESET);
        token.setCreatedAt(ZonedDateTime.now().minusHours(3)); 
        token.setExpiresAt(ZonedDateTime.now().minusHours(1)); 
        token.setUsed(false);
        userTokenRepository.save(token);

        return rawToken;
    }
}
