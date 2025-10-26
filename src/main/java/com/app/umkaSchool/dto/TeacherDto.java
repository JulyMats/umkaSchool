package com.app.umkaSchool.dto;

import java.util.UUID;

public record TeacherDto(
    UUID id,
    UUID userId,
    String firstName,
    String lastName,
    String email,
    String phone,
    String bio,
    String avatarUrl,
    boolean isActive
) {}