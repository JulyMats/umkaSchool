package com.app.umkaSchool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "exercise_type", schema = "school")
public class ExerciseType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "exercise_type_id", nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "base_difficulty", nullable = false)
    private Integer baseDifficulty;

    @Column(name = "avg_time_seconds", nullable = false)
    private Integer avgTimeSeconds;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parameter_ranges", columnDefinition = "jsonb")
    private String parameterRanges; // JSON: {"cardCount": [2, 20], "displaySpeed": [0.5, 3.0], "timePerQuestion": [2, 20]}

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
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