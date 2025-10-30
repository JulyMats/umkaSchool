package com.app.umkaSchool.dto.homework;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateHomeworkRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Teacher ID is required")
    private UUID teacherId;

    private List<UUID> exerciseIds; // List of exercise IDs to include
}