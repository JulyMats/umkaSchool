package com.app.umkaSchool.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;
import java.util.UUID;

@Data
@Embeddable
public class StudentAchievementId implements Serializable {
    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "achievement_id")
    private UUID achievementId;
}