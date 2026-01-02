package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
import com.app.umkaSchool.dto.exercisetype.UpdateExerciseTypeRequest;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.ExerciseType;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.ExerciseTypeRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.impl.ExerciseTypeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class ExerciseTypeServiceTest {

    @Mock
    private ExerciseTypeRepository exerciseTypeRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private ExerciseTypeServiceImpl exerciseTypeService;

    private ExerciseType testExerciseType;
    private UUID exerciseTypeId;

    @BeforeEach
    void setUp() {
        exerciseTypeId = UUID.randomUUID();

        testExerciseType = new ExerciseType();
        testExerciseType.setId(exerciseTypeId);
        testExerciseType.setName("Test Type");
        testExerciseType.setDescription("Test Description");
        testExerciseType.setBaseDifficulty(5);
        testExerciseType.setAvgTimeSeconds(60);
        testExerciseType.setParameterRanges("{\"cardCount\": [2, 20]}");
    }

    @Test
    void getAllExerciseTypes_ShouldReturnList() {
        when(exerciseTypeRepository.findAllByOrderByNameAsc()).thenReturn(List.of(testExerciseType));

        List<ExerciseTypeResponse> result = exerciseTypeService.getAllExerciseTypes();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(exerciseTypeRepository).findAllByOrderByNameAsc();
    }

    @Test
    void getExerciseTypeById_ShouldReturnExerciseType() {
        when(exerciseTypeRepository.findById(exerciseTypeId)).thenReturn(Optional.of(testExerciseType));

        ExerciseTypeResponse result = exerciseTypeService.getExerciseTypeById(exerciseTypeId);

        assertNotNull(result);
        assertEquals(exerciseTypeId, result.getId());
        verify(exerciseTypeRepository).findById(exerciseTypeId);
    }

    @Test
    void getExerciseTypeById_WhenNotFound_ShouldThrowException() {
        when(exerciseTypeRepository.findById(exerciseTypeId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            exerciseTypeService.getExerciseTypeById(exerciseTypeId);
        });
    }

    @Test
    void createExerciseType_ShouldCreateExerciseType() {
        CreateExerciseTypeRequest request = new CreateExerciseTypeRequest();
        request.setName("New Type");
        request.setDescription("New Description");
        request.setBaseDifficulty(7);
        request.setAvgTimeSeconds(90);
        request.setParameterRanges("{\"cardCount\": [5, 25]}");

        when(exerciseTypeRepository.save(any(ExerciseType.class))).thenAnswer(invocation -> {
            ExerciseType et = invocation.getArgument(0);
            et.setId(exerciseTypeId);
            return et;
        });

        ExerciseTypeResponse result = exerciseTypeService.createExerciseType(request);

        assertNotNull(result);
        verify(exerciseTypeRepository).save(any(ExerciseType.class));
    }

    @Test
    void updateExerciseType_ShouldUpdateExerciseType() {
        UpdateExerciseTypeRequest request = new UpdateExerciseTypeRequest();
        request.setName("Updated Type");
        request.setDescription("Updated Description");
        request.setBaseDifficulty(8);

        when(exerciseTypeRepository.findById(exerciseTypeId)).thenReturn(Optional.of(testExerciseType));
        when(exerciseTypeRepository.save(any(ExerciseType.class))).thenReturn(testExerciseType);

        ExerciseTypeResponse result = exerciseTypeService.updateExerciseType(exerciseTypeId, request);

        assertNotNull(result);
        verify(exerciseTypeRepository).save(testExerciseType);
    }

    @Test
    void deleteExerciseType_ShouldDeleteExerciseType() {
        when(exerciseTypeRepository.findById(exerciseTypeId)).thenReturn(Optional.of(testExerciseType));
        doNothing().when(exerciseTypeRepository).delete(testExerciseType);

        exerciseTypeService.deleteExerciseType(exerciseTypeId);

        verify(exerciseTypeRepository).delete(testExerciseType);
    }
}

