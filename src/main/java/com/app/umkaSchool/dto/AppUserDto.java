package com.app.umkaSchool.dto;

import com.app.umkaSchool.model.AppUser.UserRole;
import com.app.umkaSchool.model.enums.ThemeMode;
import java.time.ZonedDateTime;
import java.util.UUID;

public record AppUserDto(
    UUID id,
    String firstName,
    String lastName,
    String email,
    UserRole userRole,
    String appLanguage,
    String avatarUrl,
    boolean isActive,
    ThemeMode appTheme,
    ZonedDateTime lastLoginAt,
    ZonedDateTime createdAt,
    ZonedDateTime updatedAt
) {}