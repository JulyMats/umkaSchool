package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.exercise.CreateExerciseRequest;
import com.app.umkaSchool.dto.exercise.ExerciseResponse;
import com.app.umkaSchool.dto.exercise.UpdateExerciseRequest;
import com.app.umkaSchool.model.Exercise;
import com.app.umkaSchool.model.ExerciseType;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.ExerciseTypeRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.ExerciseService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExerciseServiceImpl implements ExerciseService {
    private static final Logger logger = LoggerFactory.getLogger(ExerciseServiceImpl.class);

    private final ExerciseRepository exerciseRepository;
    private final ExerciseTypeRepository exerciseTypeRepository;
    private final TeacherRepository teacherRepository;

    @Autowired
    public ExerciseServiceImpl(ExerciseRepository exerciseRepository,
                               ExerciseTypeRepository exerciseTypeRepository,
                               TeacherRepository teacherRepository) {
        this.exerciseRepository = exerciseRepository;
        this.exerciseTypeRepository = exerciseTypeRepository;
        this.teacherRepository = teacherRepository;
    }

    @Override
    @Transactional
    public ExerciseResponse createExercise(CreateExerciseRequest request) {
        logger.info("Creating new exercise for type: {}", request.getExerciseTypeId());

        ExerciseType exerciseType = exerciseTypeRepository.findById(request.getExerciseTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Exercise type not found"));

        Exercise exercise = new Exercise();
        exercise.setExerciseType(exerciseType);
        exercise.setParameters(request.getParameters());
        exercise.setDifficulty(request.getDifficulty());
        exercise.setPoints(request.getPoints());

        if (request.getCreatedById() != null) {
            Teacher teacher = teacherRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            exercise.setCreatedBy(teacher);
        }

        exercise = exerciseRepository.save(exercise);
        logger.info("Exercise created successfully: {}", exercise.getId());

        return mapToResponse(exercise);
    }

    @Override
    @Transactional
    public ExerciseResponse updateExercise(UUID exerciseId, UpdateExerciseRequest request) {
        logger.info("Updating exercise: {}", exerciseId);

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));

        if (request.getExerciseTypeId() != null) {
            ExerciseType exerciseType = exerciseTypeRepository.findById(request.getExerciseTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Exercise type not found"));
            exercise.setExerciseType(exerciseType);
        }

        if (request.getParameters() != null) {
            exercise.setParameters(request.getParameters());
        }
        if (request.getDifficulty() != null) {
            exercise.setDifficulty(request.getDifficulty());
        }
        if (request.getPoints() != null) {
            exercise.setPoints(request.getPoints());
        }
        if (request.getCreatedById() != null) {
            Teacher teacher = teacherRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            exercise.setCreatedBy(teacher);
        }

        exercise = exerciseRepository.save(exercise);
        logger.info("Exercise updated successfully: {}", exerciseId);

        return mapToResponse(exercise);
    }

    @Override
    public ExerciseResponse getExerciseById(UUID exerciseId) {
        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));
        return mapToResponse(exercise);
    }

    @Override
    public List<ExerciseResponse> getAllExercises() {
        return exerciseRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseResponse> getExercisesByType(UUID exerciseTypeId) {
        return exerciseRepository.findByExerciseType_IdOrderByDifficultyAsc(exerciseTypeId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseResponse> getExercisesByTeacher(UUID teacherId) {
        return exerciseRepository.findByCreatedBy_IdOrderByCreatedAtDesc(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseResponse> getExercisesByDifficulty(Integer difficulty) {
        return exerciseRepository.findByDifficultyOrderByCreatedAtDesc(difficulty).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteExercise(UUID exerciseId) {
        logger.info("Deleting exercise: {}", exerciseId);

        Exercise exercise = exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));

        exerciseRepository.delete(exercise);
        logger.info("Exercise deleted successfully: {}", exerciseId);
    }

    @Override
    public Exercise getExerciseEntity(UUID exerciseId) {
        return exerciseRepository.findById(exerciseId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));
    }

    private ExerciseResponse mapToResponse(Exercise exercise) {
        return ExerciseResponse.builder()
                .id(exercise.getId())
                .exerciseTypeId(exercise.getExerciseType().getId())
                .exerciseTypeName(exercise.getExerciseType().getName())
                .parameters(exercise.getParameters())
                .difficulty(exercise.getDifficulty())
                .points(exercise.getPoints())
                .createdById(exercise.getCreatedBy() != null ? exercise.getCreatedBy().getId() : null)
                .createdByName(exercise.getCreatedBy() != null ?
                        exercise.getCreatedBy().getUser().getFirstName() + " " +
                                exercise.getCreatedBy().getUser().getLastName() : null)
                .createdAt(exercise.getCreatedAt())
                .updatedAt(exercise.getUpdatedAt())
                .build();
    }
}


