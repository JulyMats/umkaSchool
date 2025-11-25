package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.repository.ExerciseAttemptRepository;
import com.app.umkaSchool.service.StudentActivityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StudentActivityServiceImpl implements StudentActivityService {
    private static final Logger logger = LoggerFactory.getLogger(StudentActivityServiceImpl.class);
    private final ExerciseAttemptRepository exerciseAttemptRepository;

    public StudentActivityServiceImpl(ExerciseAttemptRepository exerciseAttemptRepository) {
        this.exerciseAttemptRepository = exerciseAttemptRepository;
    }

    @Override
    public Long totalAttempts(Student student, LocalDate date) {
        List<ExerciseAttempt> attempts = exerciseAttemptRepository.findByStudent_IdOrderByCompletedAtDesc(student.getId());

        if (date != null) {
            ZonedDateTime endOfDay = date.atTime(23, 59, 59).atZone(ZoneId.systemDefault());
            attempts = attempts.stream()
                    .filter(attempt -> attempt.getCompletedAt() != null && attempt.getCompletedAt().isBefore(endOfDay.plusSeconds(1)))
                    .collect(Collectors.toList());
        }

        return attempts.stream()
                .mapToLong(attempt -> attempt.getTotalAttempts() != null ? attempt.getTotalAttempts() : 0L)
                .sum();
    }

    @Override
    public Long totalCorrect(Student student, LocalDate date) {
        List<ExerciseAttempt> attempts = exerciseAttemptRepository.findByStudent_IdOrderByCompletedAtDesc(student.getId());

        if (date != null) {
            ZonedDateTime endOfDay = date.atTime(23, 59, 59).atZone(ZoneId.systemDefault());
            attempts = attempts.stream()
                    .filter(attempt -> attempt.getCompletedAt() != null && attempt.getCompletedAt().isBefore(endOfDay.plusSeconds(1)))
                    .collect(Collectors.toList());
        }

        return attempts.stream()
                .mapToLong(attempt -> attempt.getTotalCorrect() != null ? attempt.getTotalCorrect() : 0L)
                .sum();
    }

    @Override
    public Long totalPracticeSeconds(Student student, LocalDate date) {
        List<ExerciseAttempt> attempts = exerciseAttemptRepository.findByStudent_IdOrderByCompletedAtDesc(student.getId());

        if (date != null) {
            ZonedDateTime endOfDay = date.atTime(23, 59, 59).atZone(ZoneId.systemDefault());
            attempts = attempts.stream()
                    .filter(attempt -> attempt.getCompletedAt() != null && attempt.getCompletedAt().isBefore(endOfDay.plusSeconds(1)))
                    .collect(Collectors.toList());
        }

        return attempts.stream()
                .mapToLong(attempt -> {
                    if (attempt.getStartedAt() == null || attempt.getCompletedAt() == null) return 0L;
                    return java.time.Duration.between(attempt.getStartedAt(), attempt.getCompletedAt()).getSeconds();
                })
                .sum();
    }

    @Override
    public Integer currentStreak(Student student, LocalDate date) {
        List<ExerciseAttempt> attempts = exerciseAttemptRepository.findByStudent_IdOrderByCompletedAtDesc(student.getId());

        // Get unique dates when exercises were completed
        Set<LocalDate> completedDates = attempts.stream()
                .filter(attempt -> attempt.getCompletedAt() != null)
                .map(attempt -> attempt.getCompletedAt().toLocalDate())
                .collect(Collectors.toSet());

        if (completedDates.isEmpty()) {
            return 0;
        }

        // Calculate streak up to the given date (or today if null)
        LocalDate targetDate = date != null ? date : LocalDate.now();
        int streak = 0;
        LocalDate checkDate = targetDate;

        while (completedDates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }
}
