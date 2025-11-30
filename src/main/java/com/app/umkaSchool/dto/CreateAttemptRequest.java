package com.app.umkaSchool.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAttemptRequest {
    private UUID studentId;
    private UUID exerciseId;
    private String settings; // json string
}