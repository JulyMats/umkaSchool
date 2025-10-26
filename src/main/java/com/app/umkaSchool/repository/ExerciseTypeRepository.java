package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ExerciseType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExerciseTypeRepository extends JpaRepository<ExerciseType, UUID> {
}