package com.app.umkaSchool.dto.group;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class UpdateGroupRequest {
    @Size(min = 2, max = 100)
    private String name;

    private String description;

    private UUID teacherId;

    private List<UUID> studentIds;
}

