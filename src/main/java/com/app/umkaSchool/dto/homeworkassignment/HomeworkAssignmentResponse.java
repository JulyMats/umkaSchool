package com.app.umkaSchool.dto.homeworkassignment;

import com.app.umkaSchool.model.enums.HomeworkStatus;
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
public class HomeworkAssignmentResponse {
    private UUID id;
    private UUID homeworkId;
    private String homeworkTitle;
    private UUID teacherId;
    private String teacherName;
    private ZonedDateTime assignedAt;
    private ZonedDateTime dueDate;
    private HomeworkStatus status;
    private List<UUID> assignedGroupIds;
    private List<UUID> assignedStudentIds;
}

