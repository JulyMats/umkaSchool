package com.app.umkaSchool.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.ZonedDateTime;

@Data
@Entity
@Table(name = "homework_exercise")
public class HomeworkExercise {
    @EmbeddedId
    private HomeworkExerciseId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("homeworkId")
    @JoinColumn(name = "homework_id")
    private Homework homework;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("exerciseId")
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "required_attempts")
    private Integer requiredAttempts;

    @Column(name = "due_date", nullable = false)
    private ZonedDateTime dueDate;
}

@Embeddable
class HomeworkExerciseId implements java.io.Serializable {
    @Column(name = "homework_id")
    private UUID homeworkId;

    @Column(name = "exercise_id")
    private UUID exerciseId;

    // equals and hashCode methods
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HomeworkExerciseId that = (HomeworkExerciseId) o;
        return homeworkId.equals(that.homeworkId) && exerciseId.equals(that.exerciseId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(homeworkId, exerciseId);
    }
}