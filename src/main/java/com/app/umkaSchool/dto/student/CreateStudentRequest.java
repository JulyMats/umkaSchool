package com.app.umkaSchool.dto.student;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateStudentRequest {
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 50)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 50)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // Avatar URL (optional)
    private String avatarUrl;

    // Guardian info
    @NotBlank(message = "Guardian first name is required")
    private String guardianFirstName;

    @NotBlank(message = "Guardian last name is required")
    private String guardianLastName;

    @NotBlank(message = "Guardian email is required")
    @Email(message = "Guardian email should be valid")
    private String guardianEmail;

    @NotBlank(message = "Guardian phone is required")
    private String guardianPhone;

    @NotBlank(message = "Guardian relationship is required")
    private String guardianRelationship; // MOTHER, FATHER, GUARDIAN, OTHER

    // Optional
    private UUID teacherId;
    private UUID groupId;
}