package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Exercise;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExerciseRepository extends JpaRepository<Exercise, UUID> {
}

