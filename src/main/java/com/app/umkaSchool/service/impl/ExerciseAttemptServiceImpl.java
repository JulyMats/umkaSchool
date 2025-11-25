package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.exerciseattempt.CreateExerciseAttemptRequest;
import com.app.umkaSchool.dto.exerciseattempt.ExerciseAttemptResponse;
import com.app.umkaSchool.dto.exerciseattempt.UpdateExerciseAttemptRequest;
import com.app.umkaSchool.model.Exercise;
import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.repository.ExerciseAttemptRepository;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.StudentRepository;
import com.app.umkaSchool.service.AchievementService;
import com.app.umkaSchool.service.HomeworkAssignmentService;
import com.app.umkaSchool.service.ProgressSnapshotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExerciseAttemptServiceImpl {
    private static final Logger logger = LoggerFactory.getLogger(ExerciseAttemptServiceImpl.class);

    private final ExerciseAttemptRepository exerciseAttemptRepository;
    private final StudentRepository studentRepository;
    private final ExerciseRepository exerciseRepository;
    private final ProgressSnapshotService progressSnapshotService;
    private final AchievementService achievementService;
    private final HomeworkAssignmentService homeworkAssignmentService;

    @Autowired
    public ExerciseAttemptServiceImpl(ExerciseAttemptRepository exerciseAttemptRepository,
                                     StudentRepository studentRepository,
                                     ExerciseRepository exerciseRepository,
                                     ProgressSnapshotService progressSnapshotService,
                                     AchievementService achievementService,
                                     HomeworkAssignmentService homeworkAssignmentService) {
        this.exerciseAttemptRepository = exerciseAttemptRepository;
        this.studentRepository = studentRepository;
        this.exerciseRepository = exerciseRepository;
        this.progressSnapshotService = progressSnapshotService;
        this.achievementService = achievementService;
        this.homeworkAssignmentService = homeworkAssignmentService;
    }

    @Transactional
    public ExerciseAttemptResponse createExerciseAttempt(CreateExerciseAttemptRequest request) {
        logger.info("Creating new exercise attempt for student: {} and exercise: {}",
                request.getStudentId(), request.getExerciseId());

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));

        ExerciseAttempt attempt = new ExerciseAttempt();
        attempt.setStudent(student);
        attempt.setExercise(exercise);
        attempt.setStartedAt(request.getStartedAt());
        attempt.setScore(0);
        attempt.setSettings(request.getSettings() == null ? "{}" : request.getSettings());
        attempt.setTotalAttempts(0L);
        attempt.setTotalCorrect(0L);

        attempt = exerciseAttemptRepository.save(attempt);
        logger.info("Exercise attempt created successfully: {}", attempt.getId());

        // Not updating snapshot yet — will update on completion
        return mapToResponse(attempt);
    }

    @Transactional
    public ExerciseAttemptResponse updateExerciseAttempt(UUID attemptId, UpdateExerciseAttemptRequest request) {
        logger.info("Updating exercise attempt: {}", attemptId);

        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise attempt not found"));

        if (request.getStudentId() != null) {
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found"));
            attempt.setStudent(student);
        }

        if (request.getExerciseId() != null) {
            Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                    .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));
            attempt.setExercise(exercise);
        }

        if (request.getStartedAt() != null) {
            attempt.setStartedAt(request.getStartedAt());
        }
        if (request.getScore() != null) {
            attempt.setScore(request.getScore());
        }
        if (request.getTotalAttempts() != null) {
            attempt.setTotalAttempts(request.getTotalAttempts());
        }
        if (request.getTotalCorrect() != null) {
            attempt.setTotalCorrect(request.getTotalCorrect());
        }
        if (request.getSettings() != null) {
            attempt.setSettings(request.getSettings());
        }

        boolean shouldUpdateSnapshot = false;
        if (request.getCompletedAt() != null) {
            attempt.setCompletedAt(request.getCompletedAt());
            shouldUpdateSnapshot = true;
            logger.info("Setting completedAt from request: {}, shouldUpdateSnapshot: {}", request.getCompletedAt(), shouldUpdateSnapshot);
        } else if (attempt.getCompletedAt() == null && attempt.getScore() != null && attempt.getScore() > 0) {
            attempt.setCompletedAt(ZonedDateTime.now());
            shouldUpdateSnapshot = true;
            logger.info("Setting completedAt automatically (score > 0): {}, shouldUpdateSnapshot: {}", attempt.getCompletedAt(), shouldUpdateSnapshot);
        } else {
            logger.info("NOT updating snapshot - completedAt: {}, request.completedAt: {}, score: {}", 
                attempt.getCompletedAt(), request.getCompletedAt(), attempt.getScore());
        }

        attempt = exerciseAttemptRepository.save(attempt);
        logger.info("Exercise attempt updated successfully: {} - totalAttempts: {}, totalCorrect: {}, completedAt: {}", 
            attemptId, attempt.getTotalAttempts(), attempt.getTotalCorrect(), attempt.getCompletedAt());

        // If attempt is completed, check all homework assignments that contain this exercise
        // and update their status if all exercises are done
        if (shouldUpdateSnapshot && attempt.getCompletedAt() != null) {
            try {
                // Find all homework assignments that contain this exercise and are assigned to this student
                homeworkAssignmentService.checkAndUpdateAssignmentStatusForExercise(
                    attempt.getExercise().getId(),
                    attempt.getStudent().getId()
                );
                logger.info("Checked homework assignment status for exercise: {}, student: {}",
                    attempt.getExercise().getId(), attempt.getStudent().getId());
            } catch (Exception e) {
                logger.error("Error checking homework assignment status: {}", e.getMessage());
            }
        }

        if (shouldUpdateSnapshot) {
            try {
                logger.info("Calling updateSnapshotAfterSession for student: {}, attempt: {}", 
                    attempt.getStudent().getId(), attempt.getId());
                progressSnapshotService.updateSnapshotAfterSession(attempt.getStudent(), attempt);
                logger.info("Progress snapshot updated incrementally for student: {}", attempt.getStudent().getId());
                
                // Check and award achievements after snapshot is updated
                try {
                    achievementService.checkAndAward(attempt.getStudent(), attempt);
                } catch (Exception e) {
                    logger.error("Error checking achievements for student {}: {}", attempt.getStudent().getId(), e.getMessage());
                }
            } catch (Exception e) {
                logger.error("Error updating progress snapshot for student {}: {}", attempt.getStudent().getId(), e.getMessage());
            }
        }

        return mapToResponse(attempt);
    }

    public ExerciseAttemptResponse getExerciseAttemptById(UUID attemptId) {
        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise attempt not found"));
        return mapToResponse(attempt);
    }

    public List<ExerciseAttemptResponse> getAllExerciseAttempts() {
        return exerciseAttemptRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExerciseAttemptResponse> getExerciseAttemptsByStudent(UUID studentId) {
        return exerciseAttemptRepository.findByStudent_IdOrderByCompletedAtDesc(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExerciseAttemptResponse> getExerciseAttemptsByExercise(UUID exerciseId) {
        return exerciseAttemptRepository.findByExercise_IdOrderByCompletedAtDesc(exerciseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ExerciseAttemptResponse> getExerciseAttemptsByStudentAndExercise(UUID studentId, UUID exerciseId) {
        return exerciseAttemptRepository.findByStudent_IdAndExercise_IdOrderByCompletedAtDesc(studentId, exerciseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public Long countAttemptsByStudent(UUID studentId) {
        return exerciseAttemptRepository.countByStudent_Id(studentId);
    }

    @Transactional
    public void deleteExerciseAttempt(UUID attemptId) {
        logger.info("Deleting exercise attempt: {}", attemptId);

        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise attempt not found"));

        exerciseAttemptRepository.delete(attempt);
        logger.info("Exercise attempt deleted successfully: {}", attemptId);
    }

    public ExerciseAttempt getExerciseAttemptEntity(UUID attemptId) {
        return exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise attempt not found"));
    }

    private ExerciseAttemptResponse mapToResponse(ExerciseAttempt attempt) {
        Long totalAttempts = attempt.getTotalAttempts() == null ? 0L : attempt.getTotalAttempts();
        Long totalCorrect = attempt.getTotalCorrect() == null ? 0L : attempt.getTotalCorrect();
        java.math.BigDecimal accuracy = java.math.BigDecimal.ZERO;
        if (totalAttempts > 0) {
            accuracy = java.math.BigDecimal.valueOf(totalCorrect * 100.0 / totalAttempts).setScale(2, java.math.RoundingMode.HALF_UP);
        }

        return ExerciseAttemptResponse.builder()
                .id(attempt.getId())
                .studentId(attempt.getStudent().getId())
                .studentName(attempt.getStudent().getUser().getFirstName() + " " +
                        attempt.getStudent().getUser().getLastName())
                .exerciseId(attempt.getExercise().getId())
                .exerciseTypeName(attempt.getExercise().getExerciseType().getName())
                .startedAt(attempt.getStartedAt())
                .completedAt(attempt.getCompletedAt())
                .score(attempt.getScore())
                .totalAttempts(totalAttempts)
                .totalCorrect(totalCorrect)
                .durationSeconds(attempt.getDurationSeconds())
                .accuracy(accuracy)
                .build();
    }
}
