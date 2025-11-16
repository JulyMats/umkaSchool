package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    List<Exercise> findAllByOrderByCreatedAtDesc();
    List<Exercise> findByExerciseType_IdOrderByDifficultyAsc(UUID exerciseTypeId);
    List<Exercise> findByCreatedBy_IdOrderByCreatedAtDesc(UUID teacherId);
    List<Exercise> findByDifficultyOrderByCreatedAtDesc(Integer difficulty);
}
