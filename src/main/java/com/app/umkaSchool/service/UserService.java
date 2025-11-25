package com.app.umkaSchool.service;

import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.dto.auth.RegisterRequest;

import java.util.Optional;

public interface UserService {
    Optional<AppUser> findByEmail(String email);
    AppUser createUser(RegisterRequest request);
    void updatePassword(AppUser user, String newPassword);
}

