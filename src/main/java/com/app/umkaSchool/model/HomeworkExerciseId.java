package com.app.umkaSchool.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.util.Objects;
import java.util.UUID;

@Embeddable
@Data
public class HomeworkExerciseId implements java.io.Serializable {
    @Column(name = "homework_id")
    private UUID homeworkId;

    @Column(name = "exercise_id")
    private UUID exerciseId;

    public HomeworkExerciseId() {
    }

    public HomeworkExerciseId(UUID homeworkId, UUID exerciseId) {
        this.homeworkId = homeworkId;
        this.exerciseId = exerciseId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        HomeworkExerciseId that = (HomeworkExerciseId) o;
        return Objects.equals(homeworkId, that.homeworkId) && Objects.equals(exerciseId, that.exerciseId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(homeworkId, exerciseId);
    }
}
