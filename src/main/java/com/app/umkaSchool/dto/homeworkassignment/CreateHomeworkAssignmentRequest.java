package com.app.umkaSchool.dto.homeworkassignment;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CreateHomeworkAssignmentRequest {

    @NotNull(message = "Homework ID is required")
    private UUID homeworkId;

    private UUID teacherId;

    @NotNull(message = "Due date is required")
    private ZonedDateTime dueDate;

    private List<UUID> groupIds;

    private List<UUID> studentIds;
}

