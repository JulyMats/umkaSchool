package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.UserToken;
import com.app.umkaSchool.repository.UserTokenRepository;
import com.app.umkaSchool.service.impl.AuthServiceImpl;
import com.app.umkaSchool.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class AuthServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private UserTokenRepository userTokenRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private StudentService studentService;

    @Mock
    private TeacherService teacherService;

    @InjectMocks
    private AuthServiceImpl authService;

    private AppUser testUser;

    @BeforeEach
    void setUp() {
        testUser = new AppUser();
        testUser.setId(java.util.UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setUserRole(AppUser.UserRole.STUDENT);
        testUser.setPasswordHash("encodedPassword");
        testUser.setActive(true);

        ReflectionTestUtils.setField(authService, "refreshTokenExpirationDays", 30);
        ReflectionTestUtils.setField(authService, "passwordResetExpirationHours", 2);
        ReflectionTestUtils.setField(authService, "frontendUrl", "http://localhost:5173");
    }

    @Test
    void signup_WithDuplicateEmail_ShouldThrowException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");
        request.setRole("STUDENT");

        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        assertThrows(IllegalArgumentException.class, () -> {
            authService.signup(request);
        });
    }

    @Test
    void signup_ForStudent_WithoutDateOfBirth_ShouldThrowException() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setPassword("password123");
        request.setRole("STUDENT");
        request.setGuardianFirstName("Guardian");
        request.setGuardianLastName("Name");
        request.setGuardianEmail("guardian@example.com");
        request.setGuardianPhone("123456789");

        when(userService.findByEmail("new@example.com")).thenReturn(Optional.empty());
        when(userService.createUser(any(RegisterRequest.class))).thenReturn(testUser);

        assertThrows(IllegalArgumentException.class, () -> {
            authService.signup(request);
        });
    }

    @Test
    void signin_WithValidCredentials_ShouldReturnLoginResponse() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), anyString(), anyString())).thenReturn("jwtToken");
        when(tokenService.generateToken()).thenReturn("refreshToken");
        when(userTokenRepository.save(any(UserToken.class))).thenReturn(new UserToken());

        var result = authService.signin(request);

        assertNotNull(result);
        assertNotNull(result.getJwtToken());
        assertNotNull(result.getRefreshToken());
        assertNotNull(result.getUser());
        verify(userService).findByEmail("test@example.com");
        verify(passwordEncoder).matches("password123", "encodedPassword");
    }

    @Test
    void signin_WithInvalidPassword_ShouldThrowException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("wrongPassword");

        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("wrongPassword", "encodedPassword")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> {
            authService.signin(request);
        });
    }

    @Test
    void signin_WithInactiveUser_ShouldThrowException() {
        testUser.setActive(false);
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        when(userService.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> {
            authService.signin(request);
        });
    }

    @Test
    void signin_WithNonExistentUser_ShouldThrowException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("notfound@example.com");
        request.setPassword("password123");

        when(userService.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> {
            authService.signin(request);
        });
    }
}

