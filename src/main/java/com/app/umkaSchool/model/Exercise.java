package com.app.umkaSchool.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "exercise")
public class Exercise {
    @Id
    @Column(name = "exercise_id", insertable = false, updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exercise_type_id", nullable = false)
    private ExerciseType exerciseType;

    @Column(columnDefinition = "jsonb", nullable = false)
    private String parameters;

    @Column(nullable = false)
    private Integer difficulty;

    @Column(name = "estimated_seconds", nullable = false)
    private Integer estimatedSeconds;

    @Column(nullable = false)
    private Integer points;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private Teacher createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
}