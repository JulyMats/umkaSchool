package com.app.umkaSchool.dto;

import com.app.umkaSchool.model.enums.GuardianRelationship;
import java.util.UUID;

public record GuardianDto(
    UUID id,
    String firstName,
    String lastName,
    String email,
    String phone,
    GuardianRelationship relationship
) {}