package com.app.umkaSchool.dto.exerciseattempt;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class CreateExerciseAttemptRequest {
    @NotNull(message = "Student ID is required")
    private UUID studentId;

    @NotNull(message = "Exercise ID is required")
    private UUID exerciseId;

    private ZonedDateTime startedAt;

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score must be at least 0")
    private Integer score;

    @NotNull(message = "Time spent in seconds is required")
    @Min(value = 1, message = "Time spent must be at least 1 second")
    private Integer timeSpentSeconds;

    @NotNull(message = "Accuracy is required")
    @DecimalMin(value = "0.00", message = "Accuracy must be between 0 and 100")
    @DecimalMax(value = "100.00", message = "Accuracy must be between 0 and 100")
    private BigDecimal accuracy;

    @Min(value = 0, message = "Mistakes must be at least 0")
    private Integer mistakes = 0;
}