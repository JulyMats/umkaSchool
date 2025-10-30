package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
import com.app.umkaSchool.dto.exercisetype.UpdateExerciseTypeRequest;
import com.app.umkaSchool.service.ExerciseTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/exercise-types")
public class ExerciseTypeController {

    private final ExerciseTypeService exerciseTypeService;

    @Autowired
    public ExerciseTypeController(ExerciseTypeService exerciseTypeService) {
        this.exerciseTypeService = exerciseTypeService;
    }

    @PostMapping
    public ResponseEntity<ExerciseTypeResponse> createExerciseType(@Valid @RequestBody CreateExerciseTypeRequest request) {
        ExerciseTypeResponse response = exerciseTypeService.createExerciseType(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{exerciseTypeId}")
    public ResponseEntity<ExerciseTypeResponse> updateExerciseType(
            @PathVariable UUID exerciseTypeId,
            @Valid @RequestBody UpdateExerciseTypeRequest request) {
        ExerciseTypeResponse response = exerciseTypeService.updateExerciseType(exerciseTypeId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{exerciseTypeId}")
    public ResponseEntity<ExerciseTypeResponse> getExerciseTypeById(@PathVariable UUID exerciseTypeId) {
        ExerciseTypeResponse response = exerciseTypeService.getExerciseTypeById(exerciseTypeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<ExerciseTypeResponse> getExerciseTypeByName(@PathVariable String name) {
        ExerciseTypeResponse response = exerciseTypeService.getExerciseTypeByName(name);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ExerciseTypeResponse>> getAllExerciseTypes() {
        List<ExerciseTypeResponse> exerciseTypes = exerciseTypeService.getAllExerciseTypes();
        return ResponseEntity.ok(exerciseTypes);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<ExerciseTypeResponse>> getExerciseTypesByTeacher(@PathVariable UUID teacherId) {
        List<ExerciseTypeResponse> exerciseTypes = exerciseTypeService.getExerciseTypesByTeacher(teacherId);
        return ResponseEntity.ok(exerciseTypes);
    }

    @DeleteMapping("/{exerciseTypeId}")
    public ResponseEntity<Void> deleteExerciseType(@PathVariable UUID exerciseTypeId) {
        exerciseTypeService.deleteExerciseType(exerciseTypeId);
        return ResponseEntity.noContent().build();
    }
}