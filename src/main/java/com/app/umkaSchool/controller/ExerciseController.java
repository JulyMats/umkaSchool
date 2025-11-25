package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercise.UpdateExerciseRequest;
import com.app.umkaSchool.service.ExerciseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<List<ExerciseResponse>> getAllExercises() {
        List<ExerciseResponse> exercises = exerciseService.getAllExercises();
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/type/{exerciseTypeId}")
    public ResponseEntity<List<ExerciseResponse>> getExercisesByType(@PathVariable UUID exerciseTypeId) {
        List<ExerciseResponse> exercises = exerciseService.getExercisesByType(exerciseTypeId);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ExerciseResponse>> getExercisesByTeacher(@PathVariable UUID teacherId) {
        List<ExerciseResponse> exercises = exerciseService.getExercisesByTeacher(teacherId);
        return ResponseEntity.ok(exercises);
    }

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ExerciseResponse>> getExercisesByDifficulty(@PathVariable Integer difficulty) {
        List<ExerciseResponse> exercises = exerciseService.getExercisesByDifficulty(difficulty);
        return ResponseEntity.ok(exercises);
    }

    @DeleteMapping("/{exerciseId}")
    public ResponseEntity<Void> deleteExercise(@PathVariable UUID exerciseId) {
        exerciseService.deleteExercise(exerciseId);
        return ResponseEntity.noContent().build();
    }
}


