package com.app.umkaSchool.dto.group;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateGroupRequest {
    @NotBlank(message = "Group name is required")
    @Size(min = 2, max = 100)
    private String name;

    @NotBlank(message = "Group code is required")
    @Size(min = 3, max = 5, message = "Group code must be between 3 and 5 characters")
    private String code;

    private String description;

    private UUID teacherId;

    private List<UUID> studentIds;
}

