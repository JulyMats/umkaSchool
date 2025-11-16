package com.app.umkaSchool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Duration;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "exercise_attempt")
public class ExerciseAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attempt_id", nullable = false)
    private UUID id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Column(name = "started_at")
    private ZonedDateTime startedAt;

    @Column(name = "completed_at")
    private ZonedDateTime completedAt;

    // JSON settings chosen by the student for this attempt (answer timeout, flip interval, cards count, digits allowed)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "settings", columnDefinition = "jsonb", nullable = false)
    private String settings;

    @Column(name = "total_attempts", nullable = false)
    private Long totalAttempts = 0L;

    @Column(name = "total_correct", nullable = false)
    private Long totalCorrect = 0L;

    @Column(nullable = false)
    private Integer score;

    // Transient helper to compute duration in seconds from startedAt and completedAt
    @Transient
    public long getDurationSeconds() {
        if (startedAt == null || completedAt == null) return 0L;
        return Duration.between(startedAt, completedAt).getSeconds();
    }

}