package com.app.umkaSchool.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;
import java.util.UUID;

@Data
@Embeddable
public class DailyChallengeExerciseId implements Serializable {
    @Column(name = "daily_challenge_id")
    private UUID dailyChallengeId;

    @Column(name = "exercise_id")
    private UUID exerciseId;
}

