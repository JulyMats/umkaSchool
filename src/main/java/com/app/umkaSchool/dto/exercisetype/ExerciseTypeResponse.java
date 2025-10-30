package com.app.umkaSchool.dto.exercisetype;

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
public class ExerciseTypeResponse {
    private UUID id;
    private String name;
    private String description;
    private Integer baseDifficulty;
    private Integer avgTimeSeconds;
    private UUID createdById;
    private String createdByName;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}



