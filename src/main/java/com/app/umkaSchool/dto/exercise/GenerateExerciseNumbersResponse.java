package com.app.umkaSchool.dto.exercise;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenerateExerciseNumbersResponse {
    private List<Integer> numbers;
    private Double expectedAnswer;
    private String exerciseTypeName;
}

