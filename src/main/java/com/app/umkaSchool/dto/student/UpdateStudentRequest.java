package com.app.umkaSchool.dto.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateStudentRequest {
    private String firstName;
    private String lastName;

    @Email(message = "Email should be valid")
    private String email;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private UUID teacherId;
    private UUID groupId;

    // Guardian info
    private String guardianFirstName;
    private String guardianLastName;

    @Email(message = "Guardian email should be valid")
    private String guardianEmail;
    private String guardianPhone;
    private String guardianRelationship;
}

