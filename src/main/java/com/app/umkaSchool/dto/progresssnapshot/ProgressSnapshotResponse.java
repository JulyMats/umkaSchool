package com.app.umkaSchool.dto.progresssnapshot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;
import java.time.LocalDate;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressSnapshotResponse {
    // renamed to avoid builder method conflict
    private UUID snapshotId;
    private UUID studentId;
    private String studentName;
    private LocalDate snapshotDate;

    // Aggregated counters
    private Long totalAttempts;
    private Long totalCorrect;
    private Long totalPracticeSeconds;

    private Integer currentStreak;
    private ZonedDateTime createdAt;
}
