package com.app.umkaSchool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.Objects;
import java.util.UUID;

@Data
@Entity
@Table(name = "homework_exercise", schema = "school")
public class HomeworkExercise {
    @EmbeddedId
    private HomeworkExerciseId id = new HomeworkExerciseId();

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("homeworkId")
    @JoinColumn(name = "homework_id")
    private Homework homework;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("exerciseId")
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "required_attempts")
    private Integer requiredAttempts;
}
