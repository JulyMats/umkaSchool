package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.homework.CreateHomeworkRequest;
import com.app.umkaSchool.dto.homework.HomeworkResponse;
import com.app.umkaSchool.dto.homework.UpdateHomeworkRequest;
import com.app.umkaSchool.model.*;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.HomeworkRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.HomeworkService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HomeworkServiceImpl implements HomeworkService {
    private static final Logger logger = LoggerFactory.getLogger(HomeworkServiceImpl.class);

    private final HomeworkRepository homeworkRepository;
    private final TeacherRepository teacherRepository;
    private final ExerciseRepository exerciseRepository;

    @Autowired
    public HomeworkServiceImpl(HomeworkRepository homeworkRepository,
                               TeacherRepository teacherRepository,
                               ExerciseRepository exerciseRepository) {
        this.homeworkRepository = homeworkRepository;
        this.teacherRepository = teacherRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Override
    @Transactional
    public HomeworkResponse createHomework(CreateHomeworkRequest request) {
        logger.info("Creating new homework: {}", request.getTitle());

        if (homeworkRepository.existsByTitle(request.getTitle())) {
            throw new IllegalArgumentException("Homework with this title already exists");
        }

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        Homework homework = new Homework();
        homework.setTitle(request.getTitle());
        homework.setDescription(request.getDescription());
        homework.setTeacher(teacher);

        // Initialize empty exercises set to avoid lazy initialization issues
        homework.setExercises(new HashSet<>());

        // Save homework first to get ID
        homework = homeworkRepository.saveAndFlush(homework);

        // Add exercises if provided
        if (request.getExerciseIds() != null && !request.getExerciseIds().isEmpty()) {
            int orderIndex = 0;
            for (UUID exerciseId : request.getExerciseIds()) {
                Exercise exercise = exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + exerciseId));

                HomeworkExercise homeworkExercise = new HomeworkExercise();
                // Set the embedded ID fields through the entity
                homeworkExercise.getId().setHomeworkId(homework.getId());
                homeworkExercise.getId().setExerciseId(exerciseId);
                homeworkExercise.setHomework(homework);
                homeworkExercise.setExercise(exercise);
                homeworkExercise.setOrderIndex(orderIndex++);
                homeworkExercise.setRequiredAttempts(1);

                homework.getExercises().add(homeworkExercise);
            }
            // Flush changes to database
            homeworkRepository.flush();
        }

        logger.info("Homework created successfully: {}", homework.getId());

        return mapToResponse(homework);
    }

    @Override
    @Transactional
    public HomeworkResponse updateHomework(UUID homeworkId, UpdateHomeworkRequest request) {
        logger.info("Updating homework: {}", homeworkId);

        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));

        if (request.getTitle() != null && !request.getTitle().equals(homework.getTitle())) {
            if (homeworkRepository.existsByTitle(request.getTitle())) {
                throw new IllegalArgumentException("Homework with this title already exists");
            }
            homework.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            homework.setDescription(request.getDescription());
        }

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            homework.setTeacher(teacher);
        }

        // Update exercises if provided
        if (request.getExerciseIds() != null) {
            homework.getExercises().clear();
            Set<HomeworkExercise> homeworkExercises = new HashSet<>();
            int orderIndex = 0;
            for (UUID exerciseId : request.getExerciseIds()) {
                Exercise exercise = exerciseRepository.findById(exerciseId)
                        .orElseThrow(() -> new IllegalArgumentException("Exercise not found: " + exerciseId));

                HomeworkExercise homeworkExercise = new HomeworkExercise();
                // Set the embedded ID fields through the entity
                homeworkExercise.getId().setHomeworkId(homework.getId());
                homeworkExercise.getId().setExerciseId(exerciseId);
                homeworkExercise.setHomework(homework);
                homeworkExercise.setExercise(exercise);
                homeworkExercise.setOrderIndex(orderIndex++);
                homeworkExercise.setRequiredAttempts(1);

                homeworkExercises.add(homeworkExercise);
            }
            homework.setExercises(homeworkExercises);
        }

        homework = homeworkRepository.save(homework);
        logger.info("Homework updated successfully: {}", homeworkId);

        return mapToResponse(homework);
    }

    @Override
    public HomeworkResponse getHomeworkById(UUID homeworkId) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));
        return mapToResponse(homework);
    }

    @Override
    public HomeworkResponse getHomeworkByTitle(String title) {
        Homework homework = homeworkRepository.findByTitle(title)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));
        return mapToResponse(homework);
    }

    @Override
    public List<HomeworkResponse> getAllHomework() {
        return homeworkRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HomeworkResponse> getHomeworkByTeacher(UUID teacherId) {
        return homeworkRepository.findByTeacher_IdOrderByCreatedAtDesc(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteHomework(UUID homeworkId) {
        logger.info("Deleting homework: {}", homeworkId);

        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));

        homeworkRepository.delete(homework);
        logger.info("Homework deleted successfully: {}", homeworkId);
    }

    @Override
    public Homework getHomeworkEntity(UUID homeworkId) {
        return homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));
    }

    private HomeworkResponse mapToResponse(Homework homework) {
        List<HomeworkResponse.ExerciseInfo> exerciseInfos = homework.getExercises().stream()
                .map(he -> HomeworkResponse.ExerciseInfo.builder()
                        .exerciseId(he.getExercise().getId())
                        .exerciseTypeName(he.getExercise().getExerciseType().getName())
                        .difficulty(he.getExercise().getDifficulty())
                        .points(he.getExercise().getPoints())
                        .build())
                .collect(Collectors.toList());

        return HomeworkResponse.builder()
                .id(homework.getId())
                .title(homework.getTitle())
                .description(homework.getDescription())
                .teacherId(homework.getTeacher().getId())
                .teacherName(homework.getTeacher().getUser().getFirstName() + " " +
                        homework.getTeacher().getUser().getLastName())
                .createdAt(homework.getCreatedAt())
                .updatedAt(homework.getUpdatedAt())
                .exercises(exerciseInfos)
                .build();
    }
}
