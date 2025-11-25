package com.app.umkaSchool.dto;

import java.util.UUID;

public class CreateAttemptRequest {
    private UUID studentId;
    private UUID exerciseId;
    private String settings; // json string

    public UUID getStudentId() { return studentId; }
    public void setStudentId(UUID studentId) { this.studentId = studentId; }
    public UUID getExerciseId() { return exerciseId; }
    public void setExerciseId(UUID exerciseId) { this.exerciseId = exerciseId; }
    public String getSettings() { return settings; }
    public void setSettings(String settings) { this.settings = settings; }
}