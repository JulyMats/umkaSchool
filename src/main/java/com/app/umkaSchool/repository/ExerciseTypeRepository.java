package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ExerciseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseTypeRepository extends JpaRepository<ExerciseType, UUID> {
    List<ExerciseType> findByBaseDifficultyLessThanEqual(Integer maxDifficulty);
    List<ExerciseType> findByName(String name);
}