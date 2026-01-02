package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercise.GenerateExerciseNumbersRequest;
import com.app.umkaSchool.dto.exercise.GenerateExerciseNumbersResponse;
import com.app.umkaSchool.dto.exercise.UpdateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ValidateAnswerRequest;
import com.app.umkaSchool.dto.exercise.ValidateAnswerResponse;
import com.app.umkaSchool.service.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;

    @Autowired
    public ExerciseController(ExerciseService exerciseService) {
        this.exerciseService = exerciseService;
    }

    @PostMapping
    public ResponseEntity<ExerciseResponse> createExercise(@Valid @RequestBody CreateExerciseRequest request) {
        ExerciseResponse response = exerciseService.createExercise(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{exerciseId}")
    public ResponseEntity<ExerciseResponse> updateExercise(
            @PathVariable UUID exerciseId,
            @Valid @RequestBody UpdateExerciseRequest request) {
        ExerciseResponse response = exerciseService.updateExercise(exerciseId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{exerciseId}")
    public ResponseEntity<ExerciseResponse> getExerciseById(@PathVariable UUID exerciseId) {
        ExerciseResponse response = exerciseService.getExerciseById(exerciseId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<Page<ExerciseResponse>> getAllExercises(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<ExerciseResponse> exercises = exerciseService.getAllExercises(pageable);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/type/{exerciseTypeId}")
    public ResponseEntity<Page<ExerciseResponse>> getExercisesByType(
            @PathVariable UUID exerciseTypeId,
            @PageableDefault(size = 20, sort = "difficulty") Pageable pageable) {
        Page<ExerciseResponse> exercises = exerciseService.getExercisesByType(exerciseTypeId, pageable);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<Page<ExerciseResponse>> getExercisesByTeacher(
            @PathVariable UUID teacherId,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<ExerciseResponse> exercises = exerciseService.getExercisesByTeacher(teacherId, pageable);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<Page<ExerciseResponse>> getExercisesByDifficulty(
            @PathVariable Integer difficulty,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<ExerciseResponse> exercises = exerciseService.getExercisesByDifficulty(difficulty, pageable);
        return ResponseEntity.ok(exercises);
    }

    @DeleteMapping("/{exerciseId}")
    public ResponseEntity<Void> deleteExercise(@PathVariable UUID exerciseId) {
        exerciseService.deleteExercise(exerciseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate-numbers")
    public ResponseEntity<GenerateExerciseNumbersResponse> generateExerciseNumbers(
            @Valid @RequestBody GenerateExerciseNumbersRequest request) {
        GenerateExerciseNumbersResponse response = exerciseService.generateExerciseNumbers(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-answer")
    public ResponseEntity<ValidateAnswerResponse> validateAnswer(
            @Valid @RequestBody ValidateAnswerRequest request) {
        ValidateAnswerResponse response = exerciseService.validateAnswer(request);
        return ResponseEntity.ok(response);
    }
}


