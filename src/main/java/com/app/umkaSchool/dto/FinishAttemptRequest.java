package com.app.umkaSchool.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinishAttemptRequest {
    private int problemsSolved; // score
    private long totalAttempts;
    private long totalCorrect;
    private int currentStreak;
}