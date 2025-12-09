package com.app.umkaSchool.dto.dailychallenge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyChallengeResponse {
    private UUID id;
    private LocalDate challengeDate;
    private String title;
    private String description;
    private UUID createdById;
    private String createdByName;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private List<ExerciseInfo> exercises;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExerciseInfo {
        private UUID exerciseId;
        private UUID exerciseTypeId;
        private String exerciseTypeName;
        private String parameters;
        private Integer difficulty;
        private Integer points;
        private Integer orderIndex;
    }
}

