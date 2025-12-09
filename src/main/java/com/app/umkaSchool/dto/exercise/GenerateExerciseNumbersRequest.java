package com.app.umkaSchool.dto.exercise;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateExerciseNumbersRequest {
    @NotNull(message = "Exercise ID is required")
    private UUID exerciseId;

    @Min(value = 1, message = "Card count must be at least 1")
    private Integer cardCount;

    @Min(value = 1, message = "Digit length must be at least 1")
    private Integer digitLength;

    private Integer min;
    private Integer max;
}

