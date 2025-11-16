package com.app.umkaSchool.dto.exerciseattempt;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExerciseAttemptRequest {
    private UUID studentId;
    private UUID exerciseId;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private ZonedDateTime startedAt;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private ZonedDateTime completedAt;

    @Min(value = 0, message = "Score must be at least 0")
    private Integer score;

    @Min(value = 0, message = "Total attempts must be at least 0")
    private Long totalAttempts;

    @Min(value = 0, message = "Total correct must be at least 0")
    private Long totalCorrect;

    // JSON settings chosen by the student for this attempt
    private String settings;
}