package com.app.umkaSchool.model;

import com.app.umkaSchool.model.enums.GuardianRelationship;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.UUID;

@Data
@Entity
@Table(name = "guardian", schema = "school")
public class Guardian {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "guardian_id", nullable = false)
    private UUID id;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phone;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(nullable = false, columnDefinition = "guardian_relationship")
    private GuardianRelationship relationship;
}