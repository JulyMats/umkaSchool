package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.achievement.AchievementResponse;
import com.app.umkaSchool.dto.achievement.StudentAchievementResponse;
import com.app.umkaSchool.model.Achievement;
import com.app.umkaSchool.model.StudentAchievement;
import com.app.umkaSchool.repository.AchievementRepository;
import com.app.umkaSchool.repository.StudentAchievementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final AchievementRepository achievementRepository;
    private final StudentAchievementRepository studentAchievementRepository;

    @Autowired
    public AchievementController(AchievementRepository achievementRepository,
                                 StudentAchievementRepository studentAchievementRepository) {
        this.achievementRepository = achievementRepository;
        this.studentAchievementRepository = studentAchievementRepository;
    }

    @GetMapping
    public ResponseEntity<List<AchievementResponse>> getAllAchievements() {
        List<Achievement> achievements = achievementRepository.findAll();
        List<AchievementResponse> responses = achievements.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<StudentAchievementResponse>> getStudentAchievements(
            @PathVariable UUID studentId) {
        List<StudentAchievement> studentAchievements = studentAchievementRepository.findByStudent_Id(studentId);
        List<StudentAchievementResponse> responses = studentAchievements.stream()
                .map(this::mapToStudentAchievementResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/student/{studentId}/recent")
    public ResponseEntity<List<StudentAchievementResponse>> getRecentStudentAchievements(
            @PathVariable UUID studentId,
            @RequestParam(defaultValue = "24") int hours) {
        ZonedDateTime cutoffTime = ZonedDateTime.now().minusHours(hours);
        List<StudentAchievement> studentAchievements = studentAchievementRepository.findByStudent_Id(studentId);
        
        List<StudentAchievementResponse> responses = studentAchievements.stream()
                .filter(sa -> sa.getEarnedAt().isAfter(cutoffTime))
                .map(sa -> {
                    StudentAchievementResponse response = mapToStudentAchievementResponse(sa);
                    return StudentAchievementResponse.builder()
                            .achievementId(response.getAchievementId())
                            .name(response.getName())
                            .description(response.getDescription())
                            .iconUrl(response.getIconUrl())
                            .points(response.getPoints())
                            .earnedAt(response.getEarnedAt())
                            .isNew(true)
                            .build();
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
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
                .build();
    }

    private StudentAchievementResponse mapToStudentAchievementResponse(StudentAchievement studentAchievement) {
        Achievement achievement = studentAchievement.getAchievement();
        return StudentAchievementResponse.builder()
                .achievementId(achievement.getId())
                .name(achievement.getName())
                .description(achievement.getDescription())
                .iconUrl(achievement.getIconUrl())
                .points(achievement.getPoints())
                .earnedAt(studentAchievement.getEarnedAt())
                .isNew(false)
                .build();
    }
}

