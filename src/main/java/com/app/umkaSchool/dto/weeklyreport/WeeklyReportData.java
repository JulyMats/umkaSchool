package com.app.umkaSchool.dto.weeklyreport;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyReportData {
    private String studentFirstName;
    private String studentLastName;
    private LocalDate weekStartDate;
    private LocalDate weekEndDate;
    private Long problemsSolved;
    private Integer accuracyRate;
    private Long practiceTimeSeconds;
    private Integer currentStreak;
    private Integer completedHomeworkCount;
    private Integer totalHomeworkCount;
    private List<SubjectProgress> subjectProgress;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubjectProgress {
        private String subjectName;
        private Long problemsSolved;
        private Integer accuracyRate;
        private Long practiceTimeSeconds;
    }
}
