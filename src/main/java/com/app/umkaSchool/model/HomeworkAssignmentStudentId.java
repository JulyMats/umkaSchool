package com.app.umkaSchool.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

import java.io.Serializable;
import java.util.UUID;

@Data
@Embeddable
public class HomeworkAssignmentStudentId implements Serializable {
    @Column(name = "homework_assignment_id")
    private UUID homeworkAssignmentId;

    @Column(name = "student_id")
    private UUID studentId;
}

