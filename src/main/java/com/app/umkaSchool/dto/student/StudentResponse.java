package com.app.umkaSchool.dto.student;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentResponse {
    private UUID id;
    private UUID userId;
    private String firstName;
    private String lastName;
    private String email;
    private LocalDate dateOfBirth;
    private ZonedDateTime enrollmentDate;
    private ZonedDateTime lastActivityAt;

    // Teacher info
    private UUID teacherId;
    private String teacherName;

    // Group info
    private UUID groupId;
    private String groupName;
    private String groupCode;

    // Guardian info
    private GuardianInfo guardian;

    // Avatar URL from user
    private String avatarUrl;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuardianInfo {
        private UUID id;
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        private String relationship;
    }
}


