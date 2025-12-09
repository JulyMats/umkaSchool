package com.app.umkaSchool.dto.exercise;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidateAnswerResponse {
    private Boolean isCorrect;
    private Double expectedAnswer;
    private Double studentAnswer;
    private Double difference;
}

