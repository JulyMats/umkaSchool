package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.AppUserDto;
import com.app.umkaSchool.model.AppUser;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AppUserService {
    List<AppUserDto> findAll();
    Optional<AppUserDto> findById(UUID id);
    Optional<AppUser> findByEmail(String email);
    AppUserDto save(AppUserDto userDto);
    void deleteById(UUID id);
    boolean existsByEmail(String email);
    void updateLastLoginTime(String email);
    void updateThemeMode(UUID id, String themeMode);
    void updateLanguage(UUID id, String language);
    void updateAvatar(UUID id, String avatarUrl);
    void updatePassword(AppUser user, String newPassword);
    void deactivateUser(UUID id);
    void activateUser(UUID id);
}

