package com.app.umkaSchool.dto.exercise;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateExerciseRequest {
    @NotNull(message = "Exercise type ID is required")
    private UUID exerciseTypeId;

    @NotBlank(message = "Parameters are required")
    private String parameters; // JSON string

    @NotNull(message = "Difficulty is required")
    @Min(value = 1, message = "Difficulty must be between 1 and 10")
    @Max(value = 10, message = "Difficulty must be between 1 and 10")
    private Integer difficulty;

    @NotNull(message = "Points are required")
    @Min(value = 0, message = "Points must be at least 0")
    private Integer points;

    private UUID createdById; // Teacher ID
}