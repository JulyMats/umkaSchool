package com.app.umkaSchool.dto.stats;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private String totalPracticeTime; // Format: "Xh Ym" or "Ym"
    private Long problemsSolved;
    private Integer accuracyRate; // Percentage 0-100
    private Integer currentStreak; // Days
    private Integer bestStreak; // Days
}

