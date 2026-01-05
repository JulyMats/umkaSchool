package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.homework.CreateHomeworkRequest;
import com.app.umkaSchool.dto.homework.HomeworkResponse;
import com.app.umkaSchool.dto.homework.UpdateHomeworkRequest;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.*;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.HomeworkRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.ExerciseService;
import com.app.umkaSchool.service.HomeworkService;
import com.app.umkaSchool.util.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
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
    private final ExerciseService exerciseService;

    @Autowired
    public HomeworkServiceImpl(HomeworkRepository homeworkRepository,
                               TeacherRepository teacherRepository,
                               ExerciseRepository exerciseRepository,
                               ExerciseService exerciseService) {
        this.homeworkRepository = homeworkRepository;
        this.teacherRepository = teacherRepository;
        this.exerciseRepository = exerciseRepository;
        this.exerciseService = exerciseService;
    }

    @Override
    @Transactional
    public HomeworkResponse createHomework(CreateHomeworkRequest request) {
        logger.info("Creating new homework: {}", request.getTitle());

        if (homeworkRepository.existsByTitle(request.getTitle())) {
            throw new IllegalArgumentException("Homework with this title already exists");
        }

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));

        Homework homework = new Homework();
        homework.setTitle(request.getTitle());
        homework.setDescription(request.getDescription());
        homework.setTeacher(teacher);

        homework.setExercises(new HashSet<>());
        homework = homeworkRepository.saveAndFlush(homework);

        if (request.getExerciseIds() != null && !request.getExerciseIds().isEmpty()) {
            int orderIndex = 0;
            for (UUID originalExerciseId : request.getExerciseIds()) {
                Exercise clonedExercise = exerciseService.cloneExercise(originalExerciseId);

                HomeworkExercise homeworkExercise = new HomeworkExercise();
                homeworkExercise.getId().setHomeworkId(homework.getId());
                homeworkExercise.getId().setExerciseId(clonedExercise.getId());
                homeworkExercise.setHomework(homework);
                homeworkExercise.setExercise(clonedExercise);
                homeworkExercise.setOrderIndex(orderIndex++);
                homeworkExercise.setRequiredAttempts(1);

                homework.getExercises().add(homeworkExercise);
            }
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
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));

        AppUser currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getUserRole() != AppUser.UserRole.ADMIN) {
            if (currentUser.getUserRole() == AppUser.UserRole.TEACHER) {
                Teacher currentTeacher = teacherRepository.findByUser_Id(currentUser.getId())
                        .orElseThrow(() -> new AccessDeniedException("Teacher profile not found"));
                if (homework.getTeacher() == null || !homework.getTeacher().getId().equals(currentTeacher.getId())) {
                    throw new AccessDeniedException("You do not have permission to update this homework");
                }
            } else {
                throw new AccessDeniedException("You do not have permission to update homework");
            }
        }
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
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            homework.setTeacher(teacher);
        }

        if (request.getExerciseIds() != null) {
            homework.getExercises().clear();
            Set<HomeworkExercise> homeworkExercises = new HashSet<>();
            int orderIndex = 0;
            for (UUID originalExerciseId : request.getExerciseIds()) {
                Exercise clonedExercise = exerciseService.cloneExercise(originalExerciseId);

                HomeworkExercise homeworkExercise = new HomeworkExercise();
                homeworkExercise.getId().setHomeworkId(homework.getId());
                homeworkExercise.getId().setExerciseId(clonedExercise.getId());
                homeworkExercise.setHomework(homework);
                homeworkExercise.setExercise(clonedExercise);
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
    @Transactional(readOnly = true)
    public HomeworkResponse getHomeworkById(UUID homeworkId) {
        Homework homework = homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));
        if (homework.getTeacher() != null && homework.getTeacher().getUser() != null) {
            homework.getTeacher().getUser().getFirstName();
        }
        return mapToResponse(homework);
    }

    @Override
    @Transactional(readOnly = true)
    public HomeworkResponse getHomeworkByTitle(String title) {
        Homework homework = homeworkRepository.findByTitle(title)
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));
        if (homework.getTeacher() != null && homework.getTeacher().getUser() != null) {
            homework.getTeacher().getUser().getFirstName();
        }
        return mapToResponse(homework);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HomeworkResponse> getAllHomework() {
        return homeworkRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
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
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));

        AppUser currentUser = SecurityUtils.getCurrentUser();
        if (currentUser.getUserRole() != AppUser.UserRole.ADMIN) {
            if (currentUser.getUserRole() == AppUser.UserRole.TEACHER) {
                Teacher currentTeacher = teacherRepository.findByUser_Id(currentUser.getId())
                        .orElseThrow(() -> new AccessDeniedException("Teacher profile not found"));
                if (homework.getTeacher() == null || !homework.getTeacher().getId().equals(currentTeacher.getId())) {
                    throw new AccessDeniedException("You do not have permission to delete this homework");
                }
            } else {
                throw new AccessDeniedException("You do not have permission to delete homework");
            }
        }
        homeworkRepository.delete(homework);
        logger.info("Homework deleted successfully: {}", homeworkId);
    }

    @Override
    public Homework getHomeworkEntity(UUID homeworkId) {
        return homeworkRepository.findById(homeworkId)
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));
    }

    @Override
    @Transactional
    public Homework cloneHomework(UUID homeworkId) {
        logger.info("Cloning homework: {}", homeworkId);

        Homework originalHomework = homeworkRepository.findByIdWithExercises(homeworkId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));

        Set<HomeworkExercise> originalExercises = originalHomework.getExercises();
        Homework clonedHomework = new Homework();
        clonedHomework.setTitle(originalHomework.getTitle());
        clonedHomework.setDescription(originalHomework.getDescription());
        clonedHomework.setTeacher(originalHomework.getTeacher());
        clonedHomework.setExercises(new HashSet<>());

        clonedHomework = homeworkRepository.saveAndFlush(clonedHomework);
        if (!originalExercises.isEmpty()) {
            for (HomeworkExercise originalHomeworkExercise : originalExercises) {
                Exercise originalExercise = originalHomeworkExercise.getExercise();
                Exercise clonedExercise = exerciseService.cloneExercise(originalExercise.getId());

                HomeworkExercise clonedHomeworkExercise = new HomeworkExercise();
                clonedHomeworkExercise.getId().setHomeworkId(clonedHomework.getId());
                clonedHomeworkExercise.getId().setExerciseId(clonedExercise.getId());
                clonedHomeworkExercise.setHomework(clonedHomework);
                clonedHomeworkExercise.setExercise(clonedExercise);
                clonedHomeworkExercise.setOrderIndex(originalHomeworkExercise.getOrderIndex());
                clonedHomeworkExercise.setRequiredAttempts(originalHomeworkExercise.getRequiredAttempts() != null 
                        ? originalHomeworkExercise.getRequiredAttempts() : 1);

                clonedHomework.getExercises().add(clonedHomeworkExercise);
            }
            homeworkRepository.flush();
        }

        logger.info("Homework cloned successfully. Original: {}, Clone: {}", 
                homeworkId, clonedHomework.getId());
        return clonedHomework;
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
