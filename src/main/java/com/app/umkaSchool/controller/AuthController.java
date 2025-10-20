package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.auth.ForgotPasswordRequest;
import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.auth.ResetPasswordRequest;
import com.app.umkaSchool.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody RegisterRequest request) {
        System.out.println("Received registration request for email: " + request.getEmail());
        try {
            authService.signup(request);
            System.out.println("Registration successful for email: " + request.getEmail());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            System.err.println("Registration failed: " + e.getMessage());
            throw e;
        }
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@Valid @RequestBody LoginRequest request) {
        String token = authService.signin(request);
        return ResponseEntity.ok().body(token);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request, @RequestHeader(value = "Origin", required = false) String origin) {
        // origin used as base URL for reset link; fallback to empty
        String base = origin != null ? origin : "";
        authService.forgotPassword(request.getEmail(), base);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok().build();
    }
}

