package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
import com.app.umkaSchool.dto.exercisetype.UpdateExerciseTypeRequest;
import com.app.umkaSchool.model.ExerciseType;

import java.util.List;
import java.util.UUID;

public interface ExerciseTypeService {
    ExerciseTypeResponse createExerciseType(CreateExerciseTypeRequest request);

    ExerciseTypeResponse updateExerciseType(UUID exerciseTypeId, UpdateExerciseTypeRequest request);

    ExerciseTypeResponse getExerciseTypeById(UUID exerciseTypeId);

    ExerciseTypeResponse getExerciseTypeByName(String name);

    List<ExerciseTypeResponse> getAllExerciseTypes();

    List<ExerciseTypeResponse> getExerciseTypesByTeacher(UUID teacherId);

    void deleteExerciseType(UUID exerciseTypeId);

    ExerciseType getExerciseTypeEntity(UUID exerciseTypeId);
}