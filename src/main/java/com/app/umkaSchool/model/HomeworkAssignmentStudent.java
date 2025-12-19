package com.app.umkaSchool.model;

import com.app.umkaSchool.model.enums.HomeworkStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "homework_assignment_student")
public class HomeworkAssignmentStudent {
    @EmbeddedId
    private HomeworkAssignmentStudentId id = new HomeworkAssignmentStudentId();

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("homeworkAssignmentId")
    @JoinColumn(name = "homework_assignment_id")
    private HomeworkAssignment homeworkAssignment;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "homework_assignment_status", nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private HomeworkStatus status = HomeworkStatus.PENDING;
}