package com.app.umkaSchool.dto.teacher;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateTeacherRequest {
    private String firstName;
    private String lastName;

    @Email(message = "Email should be valid")
    private String email;

    private String bio;
    private String phone;
}

