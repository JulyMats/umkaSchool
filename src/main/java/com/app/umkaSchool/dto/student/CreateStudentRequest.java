package com.app.umkaSchool.dto.student;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateStudentRequest {
    @NotBlank(message = "First name is required")
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    private String avatarUrl;

    // Guardian info
    @NotBlank(message = "Guardian first name is required")
    @Size(min = 2, max = 100, message = "Guardian first name must be between 2 and 100 characters")
    private String guardianFirstName;

    @NotBlank(message = "Guardian last name is required")
    @Size(min = 2, max = 100, message = "Guardian last name must be between 2 and 100 characters")
    private String guardianLastName;

    @NotBlank(message = "Guardian email is required")
    @Email(message = "Guardian email should be valid")
    @Size(max = 255, message = "Guardian email must not exceed 255 characters")
    private String guardianEmail;

    @NotBlank(message = "Guardian phone is required")
    @Size(max = 50, message = "Guardian phone must not exceed 50 characters")
    private String guardianPhone;

    @NotBlank(message = "Guardian relationship is required")
    private String guardianRelationship; // MOTHER, FATHER, GUARDIAN, OTHER

    private UUID teacherId;
    private UUID groupId;
}