package com.app.umkaSchool.dto.achievement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AchievementResponse {
    private UUID id;
    private String name;
    private String description;
    private String iconUrl;
    private String requiredCriteria; // JSON string
    private Integer points;
    private ZonedDateTime createdAt;
}

