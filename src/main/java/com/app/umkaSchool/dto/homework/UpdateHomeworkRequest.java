package com.app.umkaSchool.dto.homework;

import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UpdateHomeworkRequest {
    private String title;
    private String description;
    private UUID teacherId;
    private List<UUID> exerciseIds; // List of exercise IDs to include
}
