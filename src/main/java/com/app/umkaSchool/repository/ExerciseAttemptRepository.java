package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, UUID> {
    List<ExerciseAttempt> findByStudent_IdOrderByCompletedAtDesc(UUID studentId);

    List<ExerciseAttempt> findByExercise_IdOrderByCompletedAtDesc(UUID exerciseId);

    List<ExerciseAttempt> findByStudent_IdAndExercise_IdOrderByCompletedAtDesc(UUID studentId, UUID exerciseId);

    Long countByStudent_Id(UUID studentId);

    Long countByStudent_IdAndExercise_Id(UUID studentId, UUID exerciseId);
}
