package com.app.umkaSchool.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "progress_snapshot")
public class ProgressSnapshot {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "progress_snapshot_id", nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "total_practice_seconds", nullable = false)
    private Long totalPracticeSeconds;

    @Column(name = "current_streak", nullable = false)
    private Integer currentStreak;

    @Column(name = "total_attempts", nullable = false)
    private Long totalAttempts;

    @Column(name = "total_correct", nullable = false)
    private Long totalCorrect;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;
}