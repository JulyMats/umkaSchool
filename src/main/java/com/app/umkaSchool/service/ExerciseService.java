package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercise.UpdateExerciseRequest;
import com.app.umkaSchool.model.Exercise;

import java.util.List;
import java.util.UUID;

public interface ExerciseService {
    ExerciseResponse createExercise(CreateExerciseRequest request);

    ExerciseResponse updateExercise(UUID exerciseId, UpdateExerciseRequest request);

    ExerciseResponse getExerciseById(UUID exerciseId);

    List<ExerciseResponse> getAllExercises();

    List<ExerciseResponse> getExercisesByType(UUID exerciseTypeId);

    List<ExerciseResponse> getExercisesByTeacher(UUID teacherId);

    List<ExerciseResponse> getExercisesByDifficulty(Integer difficulty);

    void deleteExercise(UUID exerciseId);

    Exercise getExerciseEntity(UUID exerciseId);
}