package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.exerciseattempt.CreateExerciseAttemptRequest;
import com.app.umkaSchool.dto.exerciseattempt.ExerciseAttemptResponse;
import com.app.umkaSchool.dto.exerciseattempt.UpdateExerciseAttemptRequest;
import com.app.umkaSchool.service.impl.ExerciseAttemptServiceImpl;
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

    private final ExerciseAttemptServiceImpl exerciseAttemptService;

    @Autowired
    public ExerciseAttemptController(ExerciseAttemptServiceImpl exerciseAttemptService) {
        this.exerciseAttemptService = exerciseAttemptService;
    }

    @PostMapping
    public ResponseEntity<ExerciseAttemptResponse> createAttempt(@Valid @RequestBody CreateExerciseAttemptRequest request) {
        ExerciseAttemptResponse response = exerciseAttemptService.createExerciseAttempt(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{attemptId}")
    public ResponseEntity<ExerciseAttemptResponse> updateAttempt(
            @PathVariable UUID attemptId,
            @Valid @RequestBody UpdateExerciseAttemptRequest request) {
        ExerciseAttemptResponse response = exerciseAttemptService.updateExerciseAttempt(attemptId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ExerciseAttemptResponse> getById(@PathVariable UUID attemptId) {
        ExerciseAttemptResponse response = exerciseAttemptService.getExerciseAttemptById(attemptId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ExerciseAttemptResponse>> getAll() {
        return ResponseEntity.ok(exerciseAttemptService.getAllExerciseAttempts());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ExerciseAttemptResponse>> getByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(exerciseAttemptService.getExerciseAttemptsByStudent(studentId));
    }

    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<List<ExerciseAttemptResponse>> getByExercise(@PathVariable UUID exerciseId) {
        return ResponseEntity.ok(exerciseAttemptService.getExerciseAttemptsByExercise(exerciseId));
    }

    @GetMapping("/student/{studentId}/count")
    public ResponseEntity<Long> countByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(exerciseAttemptService.countAttemptsByStudent(studentId));
    }

    @DeleteMapping("/{attemptId}")
    public ResponseEntity<Void> deleteAttempt(@PathVariable UUID attemptId) {
        exerciseAttemptService.deleteExerciseAttempt(attemptId);
        return ResponseEntity.noContent().build();
    }
}
