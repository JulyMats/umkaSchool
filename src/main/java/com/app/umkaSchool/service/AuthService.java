package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.RegisterRequest;

public interface AuthService {
    void signup(RegisterRequest request);
    String signin(LoginRequest request);
    void forgotPassword(String email, String appBaseUrl);
    void resetPassword(String token, String newPassword);
}

