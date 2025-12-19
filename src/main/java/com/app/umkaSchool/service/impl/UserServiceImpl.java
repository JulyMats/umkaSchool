package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.user.UpdateUserRequest;
import com.app.umkaSchool.dto.user.UserResponse;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Cacheable(value = "users", key = "'email:' + #email")
    public Optional<AppUser> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    @Cacheable(value = "users", key = "#userId.toString()")
    public Optional<AppUser> findById(UUID userId) {
        return userRepository.findById(userId);
    }

    @Override
    public AppUser createUser(RegisterRequest request) {
        AppUser user = new AppUser();
        user.setUserRole(AppUser.UserRole.valueOf(request.getRole().toUpperCase()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        String encoded = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(encoded);
        user.setAvatarUrl("/static/default-avatar.png");
        user.setActive(true);
        return userRepository.save(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId.toString()")
    public void updatePassword(UUID userId, String newPassword) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public UserResponse getUserById(UUID userId) {
        AppUser user = findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToResponse(user);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        AppUser user = findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return mapToResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true) // Evict all because email might change
    public UserResponse updateUser(UUID userId, UpdateUserRequest request) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }
        if (request.getAppLanguage() != null) {
            user.setAppLanguage(request.getAppLanguage());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getAppTheme() != null) {
            try {
                user.setAppTheme(com.app.umkaSchool.model.enums.ThemeMode.valueOf(request.getAppTheme()));
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid theme. Must be LIGHT or DARK");
            }
        }

        user = userRepository.save(user);
        return mapToResponse(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId.toString()")
    public void deleteUser(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId.toString()")
    public void activateUser(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#userId.toString()")
    public void deactivateUser(UUID userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    private UserResponse mapToResponse(AppUser user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .userRole(user.getUserRole().name())
                .appLanguage(user.getAppLanguage())
                .avatarUrl(user.getAvatarUrl())
                .appTheme(user.getAppTheme().name())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
