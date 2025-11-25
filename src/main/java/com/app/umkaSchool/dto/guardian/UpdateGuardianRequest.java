package com.app.umkaSchool.dto.guardian;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateGuardianRequest {
    private String firstName;
    private String lastName;

    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String relationship; // MOTHER, FATHER, GUARDIAN, OTHER
}