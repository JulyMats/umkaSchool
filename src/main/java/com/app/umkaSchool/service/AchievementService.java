package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.achievement.AchievementResponse;
import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.Student;

import java.util.List;
import java.util.UUID;

public interface AchievementService {
    void checkAndAward(Student student, ExerciseAttempt attempt);
    List<AchievementResponse> getAllAchievements();
    List<AchievementResponse> getStudentAchievements(UUID studentId);
    List<AchievementResponse> getRecentStudentAchievements(UUID studentId, int hours);
}


