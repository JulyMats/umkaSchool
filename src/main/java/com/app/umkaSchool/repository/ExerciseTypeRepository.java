package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ExerciseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExerciseTypeRepository extends JpaRepository<ExerciseType, UUID> {
    Optional<ExerciseType> findByName(String name);

    List<ExerciseType> findByCreatedBy_IdOrderByNameAsc(UUID teacherId);

    List<ExerciseType> findAllByOrderByNameAsc();

    boolean existsByName(String name);
}