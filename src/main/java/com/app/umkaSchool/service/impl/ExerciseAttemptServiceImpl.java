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
import com.app.umkaSchool.service.ExerciseAttemptService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ExerciseAttemptServiceImpl implements ExerciseAttemptService {
    private static final Logger logger = LoggerFactory.getLogger(ExerciseAttemptServiceImpl.class);

    private final ExerciseAttemptRepository exerciseAttemptRepository;
    private final StudentRepository studentRepository;
    private final ExerciseRepository exerciseRepository;

    @Autowired
    public ExerciseAttemptServiceImpl(ExerciseAttemptRepository exerciseAttemptRepository,
                                      StudentRepository studentRepository,
                                      ExerciseRepository exerciseRepository) {
        this.exerciseAttemptRepository = exerciseAttemptRepository;
        this.studentRepository = studentRepository;
        this.exerciseRepository = exerciseRepository;
    }

    @Override
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
        attempt.setScore(request.getScore());
        attempt.setTimeSpentSeconds(request.getTimeSpentSeconds());
        attempt.setAccuracy(request.getAccuracy());
        attempt.setMistakes(request.getMistakes());

        attempt = exerciseAttemptRepository.save(attempt);
        logger.info("Exercise attempt created successfully: {}", attempt.getId());

        return mapToResponse(attempt);
    }

    @Override
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
        if (request.getTimeSpentSeconds() != null) {
            attempt.setTimeSpentSeconds(request.getTimeSpentSeconds());
        }
        if (request.getAccuracy() != null) {
            attempt.setAccuracy(request.getAccuracy());
        }
        if (request.getMistakes() != null) {
            attempt.setMistakes(request.getMistakes());
        }

        attempt = exerciseAttemptRepository.save(attempt);
        logger.info("Exercise attempt updated successfully: {}", attemptId);

        return mapToResponse(attempt);
    }

    @Override
    public ExerciseAttemptResponse getExerciseAttemptById(UUID attemptId) {
        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise attempt not found"));
        return mapToResponse(attempt);
    }

    @Override
    public List<ExerciseAttemptResponse> getAllExerciseAttempts() {
        return exerciseAttemptRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseAttemptResponse> getExerciseAttemptsByStudent(UUID studentId) {
        return exerciseAttemptRepository.findByStudent_IdOrderByCompletedAtDesc(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseAttemptResponse> getExerciseAttemptsByExercise(UUID exerciseId) {
        return exerciseAttemptRepository.findByExercise_IdOrderByCompletedAtDesc(exerciseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ExerciseAttemptResponse> getExerciseAttemptsByStudentAndExercise(UUID studentId, UUID exerciseId) {
        return exerciseAttemptRepository.findByStudent_IdAndExercise_IdOrderByCompletedAtDesc(studentId, exerciseId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Long countAttemptsByStudent(UUID studentId) {
        return exerciseAttemptRepository.countByStudent_Id(studentId);
    }

    @Override
    @Transactional
    public void deleteExerciseAttempt(UUID attemptId) {
        logger.info("Deleting exercise attempt: {}", attemptId);

        ExerciseAttempt attempt = exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise attempt not found"));

        exerciseAttemptRepository.delete(attempt);
        logger.info("Exercise attempt deleted successfully: {}", attemptId);
    }

    @Override
    public ExerciseAttempt getExerciseAttemptEntity(UUID attemptId) {
        return exerciseAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Exercise attempt not found"));
    }

    private ExerciseAttemptResponse mapToResponse(ExerciseAttempt attempt) {
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
                .timeSpentSeconds(attempt.getTimeSpentSeconds())
                .accuracy(attempt.getAccuracy())
                .mistakes(attempt.getMistakes())
                .build();
    }
}


