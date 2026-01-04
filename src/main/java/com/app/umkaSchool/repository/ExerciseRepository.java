package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
    Page<Exercise> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Exercise> findByExerciseType_IdOrderByDifficultyAsc(UUID exerciseTypeId, Pageable pageable);
    Page<Exercise> findByCreatedBy_IdOrderByCreatedAtDesc(UUID teacherId, Pageable pageable);
    Page<Exercise> findByDifficultyOrderByCreatedAtDesc(Integer difficulty, Pageable pageable);
}
