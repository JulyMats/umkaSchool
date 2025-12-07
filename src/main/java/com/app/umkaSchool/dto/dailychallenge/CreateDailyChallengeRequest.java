package com.app.umkaSchool.dto.dailychallenge;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
public class CreateDailyChallengeRequest {
    @NotNull(message = "Challenge date is required")
    private LocalDate challengeDate;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private UUID createdById;

    @NotNull(message = "Exercises are required")
    private List<ExerciseRequest> exercises;

    @Data
    public static class ExerciseRequest {
        @NotNull(message = "Exercise ID is required")
        private UUID exerciseId;

        private Integer orderIndex = 0;
    }
}

