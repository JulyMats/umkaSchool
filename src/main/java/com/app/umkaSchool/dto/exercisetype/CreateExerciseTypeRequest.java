package com.app.umkaSchool.dto.exercisetype;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateExerciseTypeRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String description;

    @NotNull(message = "Base difficulty is required")
    @Min(value = 1, message = "Base difficulty must be between 1 and 10")
    @Max(value = 10, message = "Base difficulty must be between 1 and 10")
    private Integer baseDifficulty;

    @NotNull(message = "Average time in seconds is required")
    @Min(value = 1, message = "Average time must be at least 1 second")
    private Integer avgTimeSeconds;

    private String parameterRanges; // JSON: {"cardCount": [2, 20], "displaySpeed": [0.5, 3.0], "timePerQuestion": [2, 20]}

    private UUID createdById; // Teacher ID
}