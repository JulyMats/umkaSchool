package com.app.umkaSchool.dto.exercisetype;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateExerciseTypeRequest {
    private String name;
    private String description;

    @Min(value = 1, message = "Base difficulty must be between 1 and 10")
    @Max(value = 10, message = "Base difficulty must be between 1 and 10")
    private Integer baseDifficulty;

    @Min(value = 1, message = "Average time must be at least 1 second")
    private Integer avgTimeSeconds;

    private String parameterRanges; // JSON: {"cardCount": [2, 20], "displaySpeed": [0.5, 3.0], "timePerQuestion": [2, 20]}

    private UUID createdById; // Teacher ID
}