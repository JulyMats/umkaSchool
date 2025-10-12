package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Exercise;
import com.app.umkaSchool.model.ExerciseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    List<Exercise> findByExerciseType(ExerciseType exerciseType);
    List<Exercise> findByDifficultyBetween(Integer minDifficulty, Integer maxDifficulty);
    List<Exercise> findByExerciseTypeAndDifficultyLessThanEqual(ExerciseType type, Integer maxDifficulty);
}