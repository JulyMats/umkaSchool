package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.LoginResponse;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.auth.SignupResponse;
import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.UserToken;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.UserTokenRepository;
import com.app.umkaSchool.service.AuthService;
import com.app.umkaSchool.service.EmailService;
import com.app.umkaSchool.service.StudentService;
import com.app.umkaSchool.service.TeacherService;
import com.app.umkaSchool.service.TokenService;
import com.app.umkaSchool.service.UserService;
import com.app.umkaSchool.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserService userService;
    private final AppUserRepository userRepository;
    private final UserTokenRepository userTokenRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final StudentService studentService;
    private final TeacherService teacherService;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    public AuthServiceImpl(UserService userService,
                           AppUserRepository userRepository,
                           UserTokenRepository userTokenRepository,
                           TokenService tokenService,
                           EmailService emailService,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           StudentService studentService,
                           TeacherService teacherService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.userTokenRepository = userTokenRepository;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.studentService = studentService;
        this.teacherService = teacherService;
    }

    @Override
    @Transactional
    public SignupResponse signup(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        // Create user account
        AppUser user = userService.createUser(request);
        
        // Update avatar if provided
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
            user = userRepository.save(user);
        }

        // Create profile based on role
        if ("STUDENT".equalsIgnoreCase(request.getRole())) {
            if (request.getDateOfBirth() == null) {
                throw new IllegalArgumentException("Date of birth is required for students");
            }
            if (request.getGuardianFirstName() == null || request.getGuardianFirstName().trim().isEmpty()) {
                throw new IllegalArgumentException("Guardian first name is required for students");
            }
            if (request.getGuardianLastName() == null || request.getGuardianLastName().trim().isEmpty()) {
                throw new IllegalArgumentException("Guardian last name is required for students");
            }
            if (request.getGuardianEmail() == null || request.getGuardianEmail().trim().isEmpty()) {
                throw new IllegalArgumentException("Guardian email is required for students");
            }
            if (request.getGuardianPhone() == null || request.getGuardianPhone().trim().isEmpty()) {
                throw new IllegalArgumentException("Guardian phone is required for students");
            }
            if (request.getGuardianRelationship() == null || request.getGuardianRelationship().trim().isEmpty()) {
                throw new IllegalArgumentException("Guardian relationship is required for students");
            }
            
            // Create student profile
            CreateStudentRequest studentRequest = new CreateStudentRequest();
            studentRequest.setFirstName(request.getFirstName());
            studentRequest.setLastName(request.getLastName());
            studentRequest.setEmail(request.getEmail());
            studentRequest.setDateOfBirth(request.getDateOfBirth());
            studentRequest.setAvatarUrl(request.getAvatarUrl());
            studentRequest.setGuardianFirstName(request.getGuardianFirstName());
            studentRequest.setGuardianLastName(request.getGuardianLastName());
            studentRequest.setGuardianEmail(request.getGuardianEmail());
            studentRequest.setGuardianPhone(request.getGuardianPhone());
            studentRequest.setGuardianRelationship(request.getGuardianRelationship());
            
            studentService.createStudent(studentRequest);
        } else if ("TEACHER".equalsIgnoreCase(request.getRole())) {
            // Create teacher profile (phone and bio are optional)
            CreateTeacherRequest teacherRequest = new CreateTeacherRequest();
            teacherRequest.setFirstName(request.getFirstName());
            teacherRequest.setLastName(request.getLastName());
            teacherRequest.setEmail(request.getEmail());
            teacherRequest.setAvatarUrl(request.getAvatarUrl());
            teacherRequest.setPhone(request.getPhone());
            teacherRequest.setBio(request.getBio());
            
            teacherService.createTeacher(teacherRequest);
        }

        // Send welcome email after successful signup
        emailService.sendWelcomeEmail(
            request.getEmail(),
            request.getFirstName(),
            request.getLastName()
        );

        return SignupResponse.builder()
            .id(user.getId())
            .role(user.getUserRole().name())
            .build();
    }

    @Override
    public LoginResponse signin(LoginRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email required");
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new IllegalArgumentException("Password required");
        }

        var userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) throw new IllegalArgumentException("Invalid credentials");
        var user = userOpt.get();
        
        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is inactive");
        }
        
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        // Generate JWT access token
        String jwtToken = jwtUtil.generateToken(
            user.getEmail(),
            user.getId().toString(),
            user.getUserRole().name()
        );

        // Generate and save refresh token for token revocation
        String refreshToken = tokenService.generateToken();
        String refreshTokenHash = tokenService.hashToken(refreshToken);
        UserToken refreshTokenEntity = new UserToken();
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setTokenHash(refreshTokenHash);
        refreshTokenEntity.setTokenType(UserToken.TokenType.REFRESH_TOKEN);
        refreshTokenEntity.setCreatedAt(ZonedDateTime.now());
        refreshTokenEntity.setExpiresAt(ZonedDateTime.now().plusDays(30));
        refreshTokenEntity.setUsed(false);
        userTokenRepository.save(refreshTokenEntity);

        // Update last login
        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        // Build response with user info
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(user.getId().toString())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getUserRole().name())
            .build();

        return LoginResponse.builder()
            .jwtToken(jwtToken)
            .refreshToken(refreshToken)
            .user(userInfo)
            .build();
    }

    @Override
    public void forgotPassword(String email, String appBaseUrl) {
        logger.info("Password reset requested for email: {}", email);
        logger.info("App base URL: {}", appBaseUrl);

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.info("User not found with email: {}", email);
            return;
        }

        var user = userOpt.get();
        logger.info("User found: {} {}", user.getFirstName(), user.getLastName());

        String rawToken = tokenService.generateToken();
        String hash = tokenService.hashToken(rawToken);

        // TODO: REMOVE BEFORE PRODUCTION! Logging for testing purposes
        System.out.println("=================================================");
        System.out.println("PASSWORD RESET TOKEN FOR: " + email);
        System.out.println("TOKEN: " + rawToken);
        System.out.println("=================================================");

        UserToken token = new UserToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setTokenType(UserToken.TokenType.PASSWORD_RESET);
        token.setCreatedAt(ZonedDateTime.now());
        token.setExpiresAt(ZonedDateTime.now().plusHours(2));
        token.setUsed(false);
        userTokenRepository.save(token);
        
        logger.info("Token saved to database");

        // Use configured frontend URL if appBaseUrl is empty or null
        String baseUrl = (appBaseUrl == null || appBaseUrl.trim().isEmpty())
            ? frontendUrl
            : appBaseUrl;

        String resetLink = baseUrl + "/reset-password?token=" + rawToken;
        logger.info("Sending email with reset link: {}", resetLink);

        emailService.sendPasswordReset(user.getEmail(), resetLink);
        logger.info("Email service call completed");
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        String hash = tokenService.hashToken(token);
        var opt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                hash,
                UserToken.TokenType.PASSWORD_RESET,
                ZonedDateTime.now()
        );
        var ut = opt.orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
        var user = ut.getUser();
        userService.updatePassword(user, newPassword);
        ut.setUsed(true);
        userTokenRepository.save(ut);
    }

    @Override
    public LoginResponse refreshToken(String refreshToken) {
        String hash = tokenService.hashToken(refreshToken);
        var opt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                hash,
                UserToken.TokenType.REFRESH_TOKEN,
                ZonedDateTime.now()
        );

        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        var userToken = opt.get();
        AppUser user = userToken.getUser();

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is inactive");
        }

        // Generate new JWT access token
        String jwtToken = jwtUtil.generateToken(
            user.getEmail(),
            user.getId().toString(),
            user.getUserRole().name()
        );

        // Build response with user info
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(user.getId().toString())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getUserRole().name())
            .build();

        return LoginResponse.builder()
            .jwtToken(jwtToken)
            .refreshToken(refreshToken) // Return same refresh token
            .user(userInfo)
            .build();
    }

    @Override
    public void logout(String refreshToken) {
        logger.info("Logout requested");

        String hash = tokenService.hashToken(refreshToken);
        var opt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                hash,
                UserToken.TokenType.REFRESH_TOKEN,
                ZonedDateTime.now()
        );

        if (opt.isEmpty()) {
            logger.warn("Refresh token not found or already expired");
            // Don't throw error - token might already be invalid
            return;
        }

        var userToken = opt.get();
        userToken.setUsed(true);
        userTokenRepository.save(userToken);
        logger.info("User logged out successfully - refresh token revoked");
    }
}
