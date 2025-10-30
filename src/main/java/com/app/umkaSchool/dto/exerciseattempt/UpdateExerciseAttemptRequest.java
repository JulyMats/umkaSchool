package com.app.umkaSchool.dto.exerciseattempt;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
public class UpdateExerciseAttemptRequest {
    private UUID studentId;
    private UUID exerciseId;
    private ZonedDateTime startedAt;

    @Min(value = 0, message = "Score must be at least 0")
    private Integer score;

    @Min(value = 1, message = "Time spent must be at least 1 second")
    private Integer timeSpentSeconds;

    @DecimalMin(value = "0.00", message = "Accuracy must be between 0 and 100")
    @DecimalMax(value = "100.00", message = "Accuracy must be between 0 and 100")
    private BigDecimal accuracy;

    @Min(value = 0, message = "Mistakes must be at least 0")
    private Integer mistakes;
}