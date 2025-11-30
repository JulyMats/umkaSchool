package com.app.umkaSchool.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateUserRequest {
    @Size(min = 2, max = 100, message = "First name must be between 2 and 100 characters")
    private String firstName;

    @Size(min = 2, max = 100, message = "Last name must be between 2 and 100 characters")
    private String lastName;

    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 10, message = "Language code must not exceed 10 characters")
    private String appLanguage;

    @Size(max = 512, message = "Avatar URL must not exceed 512 characters")
    private String avatarUrl;

    private String appTheme; // LIGHT or DARK
}