package com.app.umkaSchool.dto.exercise;

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
public class ExerciseResponse {
    private UUID id;
    private UUID exerciseTypeId;
    private String exerciseTypeName;
    private String parameters; // JSON string
    private Integer difficulty;
    private Integer points;
    private UUID createdById;
    private String createdByName;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}



