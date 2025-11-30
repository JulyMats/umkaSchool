package com.app.umkaSchool.dto.student;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.UUID;

@Data
public class UpdateStudentRequest {
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;

    // Guardian info
    @Size(min = 2, max = 100, message = "Guardian first name must be between 2 and 100 characters")
    private String guardianFirstName;

    @Size(min = 2, max = 100, message = "Guardian last name must be between 2 and 100 characters")
    private String guardianLastName;

    @Email(message = "Guardian email should be valid")
    @Size(max = 255, message = "Guardian email must not exceed 255 characters")
    private String guardianEmail;

    @Size(max = 50, message = "Guardian phone must not exceed 50 characters")
    private String guardianPhone;

    private String guardianRelationship; // MOTHER, FATHER, GUARDIAN, OTHER

    private UUID teacherId;
    private UUID groupId;
}