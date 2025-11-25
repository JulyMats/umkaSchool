package com.app.umkaSchool.dto.exercise;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateExerciseRequest {
    private UUID exerciseTypeId;
    private String parameters; // JSON string

    @Min(value = 1, message = "Difficulty must be between 1 and 10")
    @Max(value = 10, message = "Difficulty must be between 1 and 10")
    private Integer difficulty;

    @Min(value = 0, message = "Points must be at least 0")
    private Integer points;

    private UUID createdById; // Teacher ID
}