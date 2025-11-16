package com.app.umkaSchool.dto.exerciseattempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExerciseAttemptResponse {
    private UUID id;
    private UUID studentId;
    private String studentName;
    private UUID exerciseId;
    private String exerciseTypeName;
    private ZonedDateTime startedAt;
    private ZonedDateTime completedAt;
    private Integer score;
    private Long totalAttempts;
    private Long totalCorrect;
    private Long durationSeconds;
    private BigDecimal accuracy; // computed as totalCorrect * 100 / totalAttempts
}
