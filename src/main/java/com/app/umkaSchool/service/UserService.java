package com.app.umkaSchool.service;

import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.user.UpdateUserRequest;
import com.app.umkaSchool.dto.user.UserResponse;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findById(UUID userId);
    AppUser createUser(RegisterRequest request);
    void updatePassword(UUID userId, String newPassword);
    
    UserResponse getUserById(UUID userId);
    UserResponse getUserByEmail(String email);
    List<UserResponse> getAllUsers();
    UserResponse updateUser(UUID userId, UpdateUserRequest request);
    void deleteUser(UUID userId);
    void activateUser(UUID userId);
    void deactivateUser(UUID userId);
}

