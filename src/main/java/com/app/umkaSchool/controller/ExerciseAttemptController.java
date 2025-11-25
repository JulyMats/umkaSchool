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

    private final ExerciseAttemptServiceImpl service;

    @Autowired
    public ExerciseAttemptController(ExerciseAttemptServiceImpl service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<ExerciseAttemptResponse> createAttempt(@Valid @RequestBody CreateExerciseAttemptRequest req) {
        ExerciseAttemptResponse created = service.createExerciseAttempt(req);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{attemptId}")
    public ResponseEntity<ExerciseAttemptResponse> updateAttempt(@PathVariable UUID attemptId, @Valid @RequestBody UpdateExerciseAttemptRequest req) {
        ExerciseAttemptResponse updated = service.updateExerciseAttempt(attemptId, req);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ExerciseAttemptResponse> getById(@PathVariable UUID attemptId) {
        ExerciseAttemptResponse resp = service.getExerciseAttemptById(attemptId);
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public ResponseEntity<List<ExerciseAttemptResponse>> getAll() {
        return ResponseEntity.ok(service.getAllExerciseAttempts());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ExerciseAttemptResponse>> getByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(service.getExerciseAttemptsByStudent(studentId));
    }

    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<List<ExerciseAttemptResponse>> getByExercise(@PathVariable UUID exerciseId) {
        return ResponseEntity.ok(service.getExerciseAttemptsByExercise(exerciseId));
    }

    @GetMapping("/student/{studentId}/count")
    public ResponseEntity<Long> countByStudent(@PathVariable UUID studentId) {
        return ResponseEntity.ok(service.countAttemptsByStudent(studentId));
    }

    @DeleteMapping("/{attemptId}")
    public ResponseEntity<Void> deleteAttempt(@PathVariable UUID attemptId) {
        service.deleteExerciseAttempt(attemptId);
        return ResponseEntity.noContent().build();
    }
}
