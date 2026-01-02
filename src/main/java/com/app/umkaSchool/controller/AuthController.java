package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.*;
import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.service.AuthService;
import com.app.umkaSchool.service.EmailService;
import com.app.umkaSchool.service.StudentService;
import com.app.umkaSchool.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final StudentService studentService;
    private final TeacherService teacherService;
    private final EmailService emailService;

    @Autowired
    public AuthController(AuthService authService, 
                         StudentService studentService,
                         TeacherService teacherService,
                         EmailService emailService) {
        this.authService = authService;
        this.studentService = studentService;
        this.teacherService = teacherService;
        this.emailService = emailService;
    }

    @PostMapping("/signup")
    @Transactional
    public ResponseEntity<SignupResponse> signup(@Valid @RequestBody RegisterRequest request) {
        // Create user account
        SignupResponse response = authService.signup(request);
        
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
            // Create teacher profile
            CreateTeacherRequest teacherRequest = new CreateTeacherRequest();
            teacherRequest.setFirstName(request.getFirstName());
            teacherRequest.setLastName(request.getLastName());
            teacherRequest.setEmail(request.getEmail());
            teacherRequest.setAvatarUrl(request.getAvatarUrl());
            teacherRequest.setPhone(request.getPhone());
            teacherRequest.setBio(request.getBio());
            
            teacherService.createTeacher(teacherRequest);
        }
        
        // Send welcome email after successful signup and profile creation
        emailService.sendWelcomeEmail(
            request.getEmail(),
            request.getFirstName(),
            request.getLastName()
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<LoginResponse> signin(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.signin(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            @RequestHeader(value = "Origin", required = false) String origin) {
        String base = origin != null ? origin : "";
        authService.forgotPassword(request.getEmail(), base);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        LoginResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.getRefreshToken());
        return ResponseEntity.ok().build();
    }
}
