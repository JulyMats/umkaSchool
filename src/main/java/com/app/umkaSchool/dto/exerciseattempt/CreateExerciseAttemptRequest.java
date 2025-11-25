package com.app.umkaSchool.dto.exerciseattempt;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateExerciseAttemptRequest {

    @NotNull(message = "studentId is required")
    private UUID studentId;

    @NotNull(message = "exerciseId is required")
    private UUID exerciseId;

    @NotNull(message = "startedAt is required")
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private ZonedDateTime startedAt;

    // optional
    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private ZonedDateTime completedAt;

    // JSON settings chosen by the student for this attempt (e.g. answer timeout, flip interval, cards count, digits allowed)
    private String settings;

    // score and totals (can be zero initially)
    private Integer score;
    private Long totalAttempts;
    private Long totalCorrect;
}