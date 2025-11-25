package com.app.umkaSchool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "student")
public class Student {
    @Id
    @Column(name = "student_id", insertable = false, updatable = false, nullable = false)
    private UUID id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser user;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = true)
    private Teacher teacher;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guardian_id", nullable = false)
    private Guardian guardian;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_group_id")
    private StudentGroup group;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @CreationTimestamp
    @Column(name = "enrollment_date", nullable = false, updatable = false)
    private ZonedDateTime enrollmentDate;

    @Column(name = "last_activity_at")
    private ZonedDateTime lastActivityAt;
}