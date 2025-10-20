package com.app.umkaSchool.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "exercise_attempt")
public class ExerciseAttempt {
    @Id
    @Column(name = "attempt_id", insertable = false, updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "started_at")
    private ZonedDateTime startedAt;

    @Column(name = "completed_at", nullable = false)
    private ZonedDateTime completedAt;

    @Column(nullable = false)
    private Integer score;

    @Column(name = "time_spent_seconds", nullable = false)
    private Integer timeSpentSeconds;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal accuracy;

    @Column(nullable = false)
    private Integer mistakes;
}