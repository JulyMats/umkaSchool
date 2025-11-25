package com.app.umkaSchool.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

import java.util.UUID;

@Data
@Entity
@Table(name = "teacher")
public class Teacher {
    @Id
    @Column(name = "teacher_id", insertable = false, updatable = false, nullable = false)
    private UUID id;

    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_user_id", nullable = false)
    private AppUser user;

    private String bio;
    
    private String phone;
}