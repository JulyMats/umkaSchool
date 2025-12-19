package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.achievement.AchievementResponse;
import com.app.umkaSchool.model.Achievement;
import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.ProgressSnapshot;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.model.StudentAchievement;
import com.app.umkaSchool.model.StudentAchievementId;
import com.app.umkaSchool.repository.AchievementRepository;
import com.app.umkaSchool.repository.StudentAchievementRepository;
import com.app.umkaSchool.service.AchievementService;
import com.app.umkaSchool.service.ProgressSnapshotService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AchievementServiceImpl implements AchievementService {
    private static final Logger logger = LoggerFactory.getLogger(AchievementServiceImpl.class);

    private final AchievementRepository achievementRepository;
    private final StudentAchievementRepository studentAchievementRepository;
    private final ProgressSnapshotService progressSnapshotService;
    private final ObjectMapper objectMapper;

    @Autowired
    public AchievementServiceImpl(AchievementRepository achievementRepository,
                                  StudentAchievementRepository studentAchievementRepository,
                                  ProgressSnapshotService progressSnapshotService,
                                  ObjectMapper objectMapper) {
        this.achievementRepository = achievementRepository;
        this.studentAchievementRepository = studentAchievementRepository;
        this.progressSnapshotService = progressSnapshotService;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void checkAndAward(Student student, ExerciseAttempt attempt) {
        logger.info("Checking achievements for student: {} after attempt: {}", student.getId(), attempt.getId());
        
        // Get all achievements
        List<Achievement> allAchievements = achievementRepository.findAll();
        
        // Get student's current progress snapshot for today
        Optional<ProgressSnapshot> snapshotOpt = progressSnapshotService.getSnapshotForDate(student, LocalDate.now());
        
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
            
            // Check accuracy criteria 
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
        } catch (JsonProcessingException e) {
            logger.error("Error parsing achievement criteria JSON for achievement {}: {}",
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

    @Override
    @Cacheable(value = "achievements")
    public List<AchievementResponse> getAllAchievements() {
        List<Achievement> achievements = achievementRepository.findAll();
        return achievements.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<AchievementResponse> getStudentAchievements(UUID studentId) {
        logger.info("Fetching achievements for student: {}", studentId);
        List<StudentAchievement> studentAchievements = studentAchievementRepository.findByStudent_Id(studentId);
        logger.info("Found {} student achievements for student: {}", studentAchievements.size(), studentId);
        
        List<AchievementResponse> responses = studentAchievements.stream()
                .map(this::mapToStudentAchievementResponse)
                .collect(Collectors.toList());
        
        logger.info("Mapped to {} achievement responses for student: {}", responses.size(), studentId);
        return responses;
    }

    @Override
    public List<AchievementResponse> getRecentStudentAchievements(UUID studentId, int hours) {
        ZonedDateTime cutoffTime = ZonedDateTime.now().minusHours(hours);
        List<StudentAchievement> studentAchievements = studentAchievementRepository.findByStudent_Id(studentId);
        
        return studentAchievements.stream()
                .filter(sa -> sa.getEarnedAt() != null && sa.getEarnedAt().isAfter(cutoffTime))
                .map(sa -> {
                    AchievementResponse response = mapToStudentAchievementResponse(sa);
                    return AchievementResponse.builder()
                            .id(response.getId())
                            .name(response.getName())
                            .description(response.getDescription())
                            .iconUrl(response.getIconUrl())
                            .requiredCriteria(response.getRequiredCriteria())
                            .points(response.getPoints())
                            .createdAt(response.getCreatedAt())
                            .earnedAt(response.getEarnedAt())
                            .isNew(true)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private AchievementResponse mapToResponse(Achievement achievement) {
        return AchievementResponse.builder()
                .id(achievement.getId())
                .name(achievement.getName())
                .description(achievement.getDescription())
                .iconUrl(achievement.getIconUrl())
                .requiredCriteria(achievement.getRequiredCriteria())
                .points(achievement.getPoints())
                .createdAt(achievement.getCreatedAt())
                .earnedAt(null)
                .isNew(null)
                .build();
    }

    private AchievementResponse mapToStudentAchievementResponse(StudentAchievement studentAchievement) {
        Achievement achievement = studentAchievement.getAchievement();
        if (achievement == null) {
            logger.error("Achievement is null for StudentAchievement with studentId: {}, achievementId: {}", 
                    studentAchievement.getId().getStudentId(), studentAchievement.getId().getAchievementId());
            throw new IllegalStateException("Achievement not loaded for StudentAchievement");
        }
        return AchievementResponse.builder()
                .id(achievement.getId())
                .name(achievement.getName())
                .description(achievement.getDescription())
                .iconUrl(achievement.getIconUrl())
                .requiredCriteria(achievement.getRequiredCriteria())
                .points(achievement.getPoints())
                .createdAt(achievement.getCreatedAt())
                .earnedAt(studentAchievement.getEarnedAt())
                .isNew(false)
                .build();
    }
}
