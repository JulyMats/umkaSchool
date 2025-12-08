package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.LoginResponse;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.auth.SignupResponse;

public interface AuthService {
    SignupResponse signup(RegisterRequest request);
    LoginResponse signin(LoginRequest request);
    LoginResponse refreshToken(String refreshToken);
    void forgotPassword(String email, String appBaseUrl);
    void resetPassword(String token, String newPassword);
    void logout(String refreshToken);
}
