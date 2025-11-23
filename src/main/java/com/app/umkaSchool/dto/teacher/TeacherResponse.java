package com.app.umkaSchool.dto.teacher;

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
public class TeacherResponse {
    private UUID id;
    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private String bio;
    private String phone;
    private int totalStudents;
    private int totalGroups;
    private ZonedDateTime createdAt;
    private String avatarUrl;
}

