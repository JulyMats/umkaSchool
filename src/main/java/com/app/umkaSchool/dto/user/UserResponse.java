package com.app.umkaSchool.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String firstName;
    private String lastName;
    private String email;
    private String userRole;
    private String appLanguage;
    private String avatarUrl;
    private String appTheme;
    private boolean isActive;
    private ZonedDateTime createdAt;
    private ZonedDateTime lastLoginAt;
}

