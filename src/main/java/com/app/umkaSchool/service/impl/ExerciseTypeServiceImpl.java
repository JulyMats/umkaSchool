package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.exercisetype.CreateExerciseTypeRequest;
import com.app.umkaSchool.dto.exercisetype.ExerciseTypeResponse;
import com.app.umkaSchool.dto.exercisetype.UpdateExerciseTypeRequest;
import com.app.umkaSchool.model.ExerciseType;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.ExerciseTypeRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.ExerciseTypeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExerciseTypeServiceImpl implements ExerciseTypeService {
    private static final Logger logger = LoggerFactory.getLogger(ExerciseTypeServiceImpl.class);

    private final ExerciseTypeRepository exerciseTypeRepository;
    private final TeacherRepository teacherRepository;

    @Autowired
    public ExerciseTypeServiceImpl(ExerciseTypeRepository exerciseTypeRepository,
                                   TeacherRepository teacherRepository) {
        this.exerciseTypeRepository = exerciseTypeRepository;
        this.teacherRepository = teacherRepository;
    }

    @Override
    @Transactional
    public ExerciseTypeResponse createExerciseType(CreateExerciseTypeRequest request) {
        logger.info("Creating new exercise type: {}", request.getName());

        if (exerciseTypeRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Exercise type with this name already exists");
        }

        ExerciseType exerciseType = new ExerciseType();
        exerciseType.setName(request.getName());
        exerciseType.setDescription(request.getDescription());
        exerciseType.setBaseDifficulty(request.getBaseDifficulty());
        exerciseType.setAvgTimeSeconds(request.getAvgTimeSeconds());
        exerciseType.setParameterRanges(request.getParameterRanges());

        if (request.getCreatedById() != null) {
            Teacher teacher = teacherRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            exerciseType.setCreatedBy(teacher);
        }

        exerciseType = exerciseTypeRepository.save(exerciseType);
        logger.info("Exercise type created successfully: {}", exerciseType.getId());

        return mapToResponse(exerciseType);
    }

    @Override
    @Transactional
    public ExerciseTypeResponse updateExerciseType(UUID exerciseTypeId, UpdateExerciseTypeRequest request) {
        logger.info("Updating exercise type: {}", exerciseTypeId);

        ExerciseType exerciseType = exerciseTypeRepository.findById(exerciseTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise type not found"));

        if (request.getName() != null && !request.getName().equals(exerciseType.getName())) {
            if (exerciseTypeRepository.existsByName(request.getName())) {
                throw new IllegalArgumentException("Exercise type with this name already exists");
            }
            exerciseType.setName(request.getName());
        }

        if (request.getDescription() != null) {
            exerciseType.setDescription(request.getDescription());
        }
        if (request.getBaseDifficulty() != null) {
            exerciseType.setBaseDifficulty(request.getBaseDifficulty());
        }
        if (request.getAvgTimeSeconds() != null) {
            exerciseType.setAvgTimeSeconds(request.getAvgTimeSeconds());
        }
        if (request.getCreatedById() != null) {
            Teacher teacher = teacherRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            exerciseType.setCreatedBy(teacher);
        }

        exerciseType = exerciseTypeRepository.save(exerciseType);
        logger.info("Exercise type updated successfully: {}", exerciseTypeId);

        return mapToResponse(exerciseType);
    }

    @Override
    public ExerciseTypeResponse getExerciseTypeById(UUID exerciseTypeId) {
        ExerciseType exerciseType = exerciseTypeRepository.findById(exerciseTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise type not found"));
        return mapToResponse(exerciseType);
    }

    @Override
    public ExerciseTypeResponse getExerciseTypeByName(String name) {
        ExerciseType exerciseType = exerciseTypeRepository.findByName(name)
                .orElseThrow(() -> new IllegalArgumentException("Exercise type not found"));
        return mapToResponse(exerciseType);
    }

    @Override
    public List<ExerciseTypeResponse> getAllExerciseTypes() {
        return exerciseTypeRepository.findAllByOrderByNameAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseTypeResponse> getExerciseTypesByTeacher(UUID teacherId) {
        return exerciseTypeRepository.findByCreatedBy_IdOrderByNameAsc(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteExerciseType(UUID exerciseTypeId) {
        logger.info("Deleting exercise type: {}", exerciseTypeId);

        ExerciseType exerciseType = exerciseTypeRepository.findById(exerciseTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise type not found"));

        exerciseTypeRepository.delete(exerciseType);
        logger.info("Exercise type deleted successfully: {}", exerciseTypeId);
    }

    @Override
    public ExerciseType getExerciseTypeEntity(UUID exerciseTypeId) {
        return exerciseTypeRepository.findById(exerciseTypeId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise type not found"));
    }

    private ExerciseTypeResponse mapToResponse(ExerciseType exerciseType) {
        return ExerciseTypeResponse.builder()
                .id(exerciseType.getId())
                .name(exerciseType.getName())
                .description(exerciseType.getDescription())
                .baseDifficulty(exerciseType.getBaseDifficulty())
                .avgTimeSeconds(exerciseType.getAvgTimeSeconds())
                .parameterRanges(exerciseType.getParameterRanges())
                .createdById(exerciseType.getCreatedBy() != null ? exerciseType.getCreatedBy().getId() : null)
                .createdByName(exerciseType.getCreatedBy() != null ?
                        exerciseType.getCreatedBy().getUser().getFirstName() + " " +
                                exerciseType.getCreatedBy().getUser().getLastName() : null)
                .createdAt(exerciseType.getCreatedAt())
                .updatedAt(exerciseType.getUpdatedAt())
                .build();
    }
}


