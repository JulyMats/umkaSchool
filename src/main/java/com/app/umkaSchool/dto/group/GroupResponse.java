package com.app.umkaSchool.dto.group;

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
public class GroupResponse {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private UUID teacherId;
    private String teacherName;
    private int studentCount;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}

