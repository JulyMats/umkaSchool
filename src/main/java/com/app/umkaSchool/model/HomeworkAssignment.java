package com.app.umkaSchool.model;

import com.app.umkaSchool.model.enums.HomeworkStatus;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Entity
@Table(name = "homework_assignment", schema = "school")
public class HomeworkAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "homework_assignment_id", nullable = false)
    private UUID id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "homework_id", nullable = false)
    private Homework homework;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private Teacher teacher;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private ZonedDateTime assignedAt;

    @Column(name = "due_date", nullable = false)
    private ZonedDateTime dueDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "homework_assignment_status", nullable = false)
    @org.hibernate.annotations.JdbcTypeCode(org.hibernate.type.SqlTypes.NAMED_ENUM)
    private HomeworkStatus status = HomeworkStatus.PENDING;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "homeworkAssignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<HomeworkAssignmentStudentGroup> assignedGroups = new HashSet<>();

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToMany(mappedBy = "homeworkAssignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<HomeworkAssignmentStudent> assignedStudents = new HashSet<>();
}

