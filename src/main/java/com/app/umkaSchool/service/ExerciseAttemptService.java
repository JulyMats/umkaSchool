package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.exerciseattempt.CreateExerciseAttemptRequest;
import com.app.umkaSchool.dto.exerciseattempt.ExerciseAttemptResponse;
import com.app.umkaSchool.dto.exerciseattempt.UpdateExerciseAttemptRequest;

import java.util.List;
import java.util.UUID;

public interface ExerciseAttemptService {
    ExerciseAttemptResponse createExerciseAttempt(CreateExerciseAttemptRequest request);
    ExerciseAttemptResponse updateExerciseAttempt(UUID attemptId, UpdateExerciseAttemptRequest request);
    ExerciseAttemptResponse getExerciseAttemptById(UUID attemptId);
    List<ExerciseAttemptResponse> getAllExerciseAttempts();
    List<ExerciseAttemptResponse> getExerciseAttemptsByStudent(UUID studentId);
    List<ExerciseAttemptResponse> getExerciseAttemptsByExercise(UUID exerciseId);
    Long countAttemptsByStudent(UUID studentId);
    void deleteExerciseAttempt(UUID attemptId);
}

