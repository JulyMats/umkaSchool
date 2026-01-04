package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercise.GenerateExerciseNumbersRequest;
import com.app.umkaSchool.dto.exercise.GenerateExerciseNumbersResponse;
import com.app.umkaSchool.dto.exercise.UpdateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ValidateAnswerRequest;
import com.app.umkaSchool.dto.exercise.ValidateAnswerResponse;
import com.app.umkaSchool.model.Exercise;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ExerciseService {
    ExerciseResponse createExercise(CreateExerciseRequest request);

    ExerciseResponse updateExercise(UUID exerciseId, UpdateExerciseRequest request);

    ExerciseResponse getExerciseById(UUID exerciseId);

    Page<ExerciseResponse> getAllExercises(Pageable pageable);

    Page<ExerciseResponse> getExercisesByType(UUID exerciseTypeId, Pageable pageable);

    Page<ExerciseResponse> getExercisesByTeacher(UUID teacherId, Pageable pageable);

    Page<ExerciseResponse> getExercisesByDifficulty(Integer difficulty, Pageable pageable);

    void deleteExercise(UUID exerciseId);

    Exercise getExerciseEntity(UUID exerciseId);

    GenerateExerciseNumbersResponse generateExerciseNumbers(GenerateExerciseNumbersRequest request);

    ValidateAnswerResponse validateAnswer(ValidateAnswerRequest request);

    Integer calculateDifficulty(UUID exerciseTypeId, String parametersJson);
    
    Exercise cloneExercise(UUID exerciseId);
}