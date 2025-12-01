package com.app.umkaSchool.dto.exercise;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ValidateAnswerRequest {
    @NotNull(message = "Exercise ID is required")
    private UUID exerciseId;

    @NotNull(message = "Numbers are required")
    private List<Integer> numbers;

    @NotNull(message = "Student answer is required")
    private Double studentAnswer;
}

