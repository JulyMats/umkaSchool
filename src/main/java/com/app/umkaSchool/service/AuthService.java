package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.auth.SignupResponse;

public interface AuthService {
    SignupResponse signup(RegisterRequest request);
    String signin(LoginRequest request);
    void forgotPassword(String email, String appBaseUrl);
    void resetPassword(String token, String newPassword);
    void logout(String token);
}
