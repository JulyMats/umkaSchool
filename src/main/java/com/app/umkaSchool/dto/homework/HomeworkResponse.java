package com.app.umkaSchool.dto.homework;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HomeworkResponse {
    private UUID id;
    private String title;
    private String description;
    private UUID teacherId;
    private String teacherName;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private List<ExerciseInfo> exercises;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExerciseInfo {
        private UUID exerciseId;
        private String exerciseTypeName;
        private Integer difficulty;
        private Integer points;
    }
}


