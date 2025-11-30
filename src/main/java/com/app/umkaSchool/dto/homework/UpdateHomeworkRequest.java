package com.app.umkaSchool.dto.homework;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UpdateHomeworkRequest {
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;
    private String description;
    private UUID teacherId;
    private List<UUID> exerciseIds; 
}
