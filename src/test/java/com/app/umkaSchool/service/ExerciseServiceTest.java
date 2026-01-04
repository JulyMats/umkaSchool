package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercise.UpdateExerciseRequest;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.Exercise;
import com.app.umkaSchool.model.ExerciseType;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.ExerciseTypeRepository;
import com.app.umkaSchool.service.impl.ExerciseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class ExerciseServiceTest {

    @Mock
    private ExerciseRepository exerciseRepository;

    @Mock
    private ExerciseTypeRepository exerciseTypeRepository;

    @InjectMocks
    private ExerciseServiceImpl exerciseService;

    private Exercise testExercise;
    private ExerciseType testExerciseType;
    private UUID exerciseId;
    private UUID exerciseTypeId;

    @BeforeEach
    void setUp() {
        exerciseId = UUID.randomUUID();
        exerciseTypeId = UUID.randomUUID();

        testExerciseType = new ExerciseType();
        testExerciseType.setId(exerciseTypeId);
        testExerciseType.setName("Test Type");
        testExerciseType.setBaseDifficulty(5);

        testExercise = new Exercise();
        testExercise.setId(exerciseId);
        testExercise.setExerciseType(testExerciseType);
        testExercise.setDifficulty(5);
        testExercise.setPoints(10);
        testExercise.setParameters("{\"param\": \"value\"}");
    }

    @Test
    void getAllExercises_ShouldReturnPage() {
        Page<Exercise> exercisePage = new PageImpl<>(List.of(testExercise));
        when(exerciseRepository.findAllByOrderByCreatedAtDesc(any(Pageable.class))).thenReturn(exercisePage);

        Page<ExerciseResponse> result = exerciseService.getAllExercises(Pageable.unpaged());

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(exerciseRepository).findAllByOrderByCreatedAtDesc(any(Pageable.class));
    }

    @Test
    void getExerciseById_ShouldReturnExercise() {
        when(exerciseRepository.findById(exerciseId)).thenReturn(Optional.of(testExercise));

        ExerciseResponse result = exerciseService.getExerciseById(exerciseId);

        assertNotNull(result);
        assertEquals(exerciseId, result.getId());
        verify(exerciseRepository).findById(exerciseId);
    }

    @Test
    void getExerciseById_WhenNotFound_ShouldThrowException() {
        when(exerciseRepository.findById(exerciseId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            exerciseService.getExerciseById(exerciseId);
        });
    }

    @Test
    void createExercise_ShouldCreateExercise() {
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setExerciseTypeId(exerciseTypeId);
        request.setDifficulty(5);
        request.setPoints(10);
        request.setParameters("{\"param\": \"value\"}");

        when(exerciseTypeRepository.findById(exerciseTypeId)).thenReturn(Optional.of(testExerciseType));
        when(exerciseRepository.save(any(Exercise.class))).thenAnswer(invocation -> {
            Exercise ex = invocation.getArgument(0);
            ex.setId(exerciseId);
            return ex;
        });

        ExerciseResponse result = exerciseService.createExercise(request);

        assertNotNull(result);
        verify(exerciseRepository).save(any(Exercise.class));
    }

    @Test
    void createExercise_WithInvalidExerciseType_ShouldThrowException() {
        CreateExerciseRequest request = new CreateExerciseRequest();
        request.setExerciseTypeId(exerciseTypeId);

        when(exerciseTypeRepository.findById(exerciseTypeId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            exerciseService.createExercise(request);
        });
    }

    @Test
    void updateExercise_ShouldUpdateExercise() {
        UpdateExerciseRequest request = new UpdateExerciseRequest();
        request.setDifficulty(7);
        request.setPoints(15);

        when(exerciseRepository.findById(exerciseId)).thenReturn(Optional.of(testExercise));
        when(exerciseRepository.save(any(Exercise.class))).thenReturn(testExercise);

        ExerciseResponse result = exerciseService.updateExercise(exerciseId, request);

        assertNotNull(result);
        verify(exerciseRepository).save(testExercise);
    }

    @Test
    void deleteExercise_ShouldDeleteExercise() {
        when(exerciseRepository.findById(exerciseId)).thenReturn(Optional.of(testExercise));
        doNothing().when(exerciseRepository).delete(testExercise);

        exerciseService.deleteExercise(exerciseId);

        verify(exerciseRepository).delete(testExercise);
    }

    @Test
    void getExercisesByType_ShouldReturnPage() {
        Page<Exercise> exercisePage = new PageImpl<>(List.of(testExercise));
        when(exerciseRepository.findByExerciseType_IdOrderByDifficultyAsc(eq(exerciseTypeId), any(Pageable.class)))
                .thenReturn(exercisePage);

        Page<ExerciseResponse> result = exerciseService.getExercisesByType(exerciseTypeId, Pageable.unpaged());

        assertNotNull(result);
        assertFalse(result.isEmpty());
        assertEquals(1, result.getTotalElements());
        verify(exerciseRepository).findByExerciseType_IdOrderByDifficultyAsc(eq(exerciseTypeId), any(Pageable.class));
    }
}

