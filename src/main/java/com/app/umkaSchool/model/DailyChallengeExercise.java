package com.app.umkaSchool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "daily_challenge_exercise", schema = "school")
public class DailyChallengeExercise {
    @EmbeddedId
    private DailyChallengeExerciseId id = new DailyChallengeExerciseId();

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("dailyChallengeId")
    @JoinColumn(name = "daily_challenge_id")
    private DailyChallenge dailyChallenge;

    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("exerciseId")
    @JoinColumn(name = "exercise_id")
    private Exercise exercise;

    @Column(name = "order_index")
    private Integer orderIndex = 0;
}

