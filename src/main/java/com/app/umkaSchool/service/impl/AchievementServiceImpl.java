package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.model.Achievement;
import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.model.StudentAchievement;
import com.app.umkaSchool.model.StudentAchievementId;
import com.app.umkaSchool.repository.AchievementRepository;
import com.app.umkaSchool.repository.StudentAchievementRepository;
import com.app.umkaSchool.service.AchievementService;
import com.app.umkaSchool.service.ProgressSnapshotService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class AchievementServiceImpl implements AchievementService {
    private static final Logger logger = LoggerFactory.getLogger(AchievementServiceImpl.class);
    
    private final AchievementRepository achievementRepository;
    private final StudentAchievementRepository studentAchievementRepository;
    private final ProgressSnapshotService progressSnapshotService;
    private final ObjectMapper objectMapper;

    public AchievementServiceImpl(AchievementRepository achievementRepository,
                                  StudentAchievementRepository studentAchievementRepository,
                                  ProgressSnapshotService progressSnapshotService) {
        this.achievementRepository = achievementRepository;
        this.studentAchievementRepository = studentAchievementRepository;
        this.progressSnapshotService = progressSnapshotService;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    @Transactional
    public void checkAndAward(Student student, ExerciseAttempt attempt) {
        logger.info("Checking achievements for student: {} after attempt: {}", student.getId(), attempt.getId());
        
        // Get all achievements
        List<Achievement> allAchievements = achievementRepository.findAll();
        
        // Get student's current progress snapshot for today
        Optional<com.app.umkaSchool.model.ProgressSnapshot> snapshotOpt = 
            progressSnapshotService.getSnapshotForDate(student, java.time.LocalDate.now());
        
        // Get aggregated stats from snapshot or calculate from attempts
        long totalAttempts = snapshotOpt.map(s -> s.getTotalAttempts() != null ? s.getTotalAttempts() : 0L)
            .orElse(0L);
        long totalCorrect = snapshotOpt.map(s -> s.getTotalCorrect() != null ? s.getTotalCorrect() : 0L)
            .orElse(0L);
        long totalPracticeSeconds = snapshotOpt.map(s -> s.getTotalPracticeSeconds() != null ? s.getTotalPracticeSeconds() : 0L)
            .orElse(0L);
        int currentStreak = snapshotOpt.map(s -> s.getCurrentStreak() != null ? s.getCurrentStreak() : 0)
            .orElse(0);
        
        // Check each achievement
        for (Achievement achievement : allAchievements) {
            // Skip if student already has this achievement
            if (studentAchievementRepository.existsByStudent_IdAndAchievement_Id(student.getId(), achievement.getId())) {
                continue;
            }
            
            // Check if criteria are met
            if (meetsCriteria(achievement, totalAttempts, totalCorrect, totalPracticeSeconds, currentStreak)) {
                // Award achievement
                awardAchievement(student, achievement);
                logger.info("Awarded achievement '{}' to student: {}", achievement.getName(), student.getId());
            }
        }
    }

    private boolean meetsCriteria(Achievement achievement, long totalAttempts, long totalCorrect, 
                                  long totalPracticeSeconds, int currentStreak) {
        try {
            JsonNode criteria = objectMapper.readTree(achievement.getRequiredCriteria());
            
            // Check totalAttempts criteria
            if (criteria.has("totalAttempts")) {
                long required = criteria.get("totalAttempts").asLong();
                if (totalAttempts < required) {
                    return false;
                }
            }
            
            // Check totalCorrect criteria
            if (criteria.has("totalCorrect")) {
                long required = criteria.get("totalCorrect").asLong();
                if (totalCorrect < required) {
                    return false;
                }
            }
            
            // Check totalPracticeSeconds criteria
            if (criteria.has("totalPracticeSeconds")) {
                long required = criteria.get("totalPracticeSeconds").asLong();
                if (totalPracticeSeconds < required) {
                    return false;
                }
            }
            
            // Check currentStreak criteria
            if (criteria.has("currentStreak")) {
                int required = criteria.get("currentStreak").asInt();
                if (currentStreak < required) {
                    return false;
                }
            }
            
            // Check accuracy criteria (if specified)
            if (criteria.has("minAccuracy")) {
                double minAccuracy = criteria.get("minAccuracy").asDouble();
                if (totalAttempts == 0) {
                    return false;
                }
                double accuracy = (double) totalCorrect / totalAttempts * 100.0;
                if (accuracy < minAccuracy) {
                    return false;
                }
            }
            
            return true;
        } catch (Exception e) {
            logger.error("Error parsing achievement criteria for achievement {}: {}", 
                achievement.getId(), e.getMessage(), e);
            return false;
        }
    }

    private void awardAchievement(Student student, Achievement achievement) {
        StudentAchievement studentAchievement = new StudentAchievement();
        StudentAchievementId id = new StudentAchievementId();
        id.setStudentId(student.getId());
        id.setAchievementId(achievement.getId());
        studentAchievement.setId(id);
        studentAchievement.setStudent(student);
        studentAchievement.setAchievement(achievement);
        
        studentAchievementRepository.save(studentAchievement);
    }
}


