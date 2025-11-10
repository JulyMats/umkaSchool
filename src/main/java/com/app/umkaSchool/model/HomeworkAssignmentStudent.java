package com.app.umkaSchool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "homework_assignment_student", schema = "school")
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
}

