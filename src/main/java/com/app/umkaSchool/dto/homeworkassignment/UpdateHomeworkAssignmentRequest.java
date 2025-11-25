package com.app.umkaSchool.dto.homeworkassignment;

import com.app.umkaSchool.model.enums.HomeworkStatus;
import lombok.Data;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class UpdateHomeworkAssignmentRequest {

    private ZonedDateTime dueDate;

    private HomeworkStatus status;

    private List<UUID> groupIds;

    private List<UUID> studentIds;
}

