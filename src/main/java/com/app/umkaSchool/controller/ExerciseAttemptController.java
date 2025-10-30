package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.exerciseattempt.CreateExerciseAttemptRequest;
import com.app.umkaSchool.dto.exerciseattempt.ExerciseAttemptResponse;
import com.app.umkaSchool.dto.exerciseattempt.UpdateExerciseAttemptRequest;
import com.app.umkaSchool.service.ExerciseAttemptService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exercise-attempts")
public class ExerciseAttemptController {

    private final ExerciseAttemptService exerciseAttemptService;

    @Autowired
    public ExerciseAttemptController(ExerciseAttemptService exerciseAttemptService) {
        this.exerciseAttemptService = exerciseAttemptService;
    }

    @PostMapping
    public ResponseEntity<ExerciseAttemptResponse> createExerciseAttempt(@Valid @RequestBody CreateExerciseAttemptRequest request) {
        ExerciseAttemptResponse response = exerciseAttemptService.createExerciseAttempt(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{attemptId}")
    public ResponseEntity<ExerciseAttemptResponse> updateExerciseAttempt(
            @PathVariable UUID attemptId,
            @Valid @RequestBody UpdateExerciseAttemptRequest request) {
        ExerciseAttemptResponse response = exerciseAttemptService.updateExerciseAttempt(attemptId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ExerciseAttemptResponse> getExerciseAttemptById(@PathVariable UUID attemptId) {
        ExerciseAttemptResponse response = exerciseAttemptService.getExerciseAttemptById(attemptId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ExerciseAttemptResponse>> getAllExerciseAttempts() {
        List<ExerciseAttemptResponse> attempts = exerciseAttemptService.getAllExerciseAttempts();
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ExerciseAttemptResponse>> getExerciseAttemptsByStudent(@PathVariable UUID studentId) {
        List<ExerciseAttemptResponse> attempts = exerciseAttemptService.getExerciseAttemptsByStudent(studentId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<List<ExerciseAttemptResponse>> getExerciseAttemptsByExercise(@PathVariable UUID exerciseId) {
        List<ExerciseAttemptResponse> attempts = exerciseAttemptService.getExerciseAttemptsByExercise(exerciseId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/student/{studentId}/exercise/{exerciseId}")
    public ResponseEntity<List<ExerciseAttemptResponse>> getExerciseAttemptsByStudentAndExercise(
            @PathVariable UUID studentId,
            @PathVariable UUID exerciseId) {
        List<ExerciseAttemptResponse> attempts = exerciseAttemptService.getExerciseAttemptsByStudentAndExercise(studentId, exerciseId);
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/student/{studentId}/count")
    public ResponseEntity<Long> countAttemptsByStudent(@PathVariable UUID studentId) {
        Long count = exerciseAttemptService.countAttemptsByStudent(studentId);
        return ResponseEntity.ok(count);
    }

    @DeleteMapping("/{attemptId}")
    public ResponseEntity<Void> deleteExerciseAttempt(@PathVariable UUID attemptId) {
        exerciseAttemptService.deleteExerciseAttempt(attemptId);
        return ResponseEntity.noContent().build();
    }
}