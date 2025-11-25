package com.app.umkaSchool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Data
@Entity
@Table(name = "homework_assignment_student_group", schema = "school")
public class HomeworkAssignmentStudentGroup {
    @EmbeddedId
    private HomeworkAssignmentStudentGroupId id = new HomeworkAssignmentStudentGroupId();

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
    @MapsId("studentGroupId")
    @JoinColumn(name = "student_group_id")
    private StudentGroup studentGroup;
}

