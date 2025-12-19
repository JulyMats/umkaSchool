package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.achievement.AchievementResponse;
import com.app.umkaSchool.service.AchievementService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final AchievementService achievementService;

    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public ResponseEntity<List<AchievementResponse>> getAllAchievements() {
        List<AchievementResponse> achievements = achievementService.getAllAchievements();
        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AchievementResponse>> getStudentAchievements(
            @PathVariable UUID studentId) {
        List<AchievementResponse> achievements = achievementService.getStudentAchievements(studentId);
        return ResponseEntity.ok(achievements);
    }

    @GetMapping("/student/{studentId}/recent")
    public ResponseEntity<List<AchievementResponse>> getRecentStudentAchievements(
            @PathVariable UUID studentId,
            @RequestParam(defaultValue = "24") int hours) {
        List<AchievementResponse> achievements = achievementService.getRecentStudentAchievements(studentId, hours);
        return ResponseEntity.ok(achievements);
    }
}