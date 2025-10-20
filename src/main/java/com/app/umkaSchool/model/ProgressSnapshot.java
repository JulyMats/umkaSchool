package com.app.umkaSchool.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "progress_snapshot")
public class ProgressSnapshot {
    @Id
    @Column(name = "progress_snapshot_id", insertable = false, updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "problems_solved", nullable = false)
    private Integer problemsSolved;

    @Column(name = "total_practice_seconds", nullable = false)
    private Long totalPracticeSeconds;

    @Column(name = "accuracy_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal accuracyPercent;

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
}