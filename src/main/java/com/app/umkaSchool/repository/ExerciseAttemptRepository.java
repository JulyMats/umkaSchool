package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, UUID> {
}

