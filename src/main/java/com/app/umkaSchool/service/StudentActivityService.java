package com.app.umkaSchool.service;

import com.app.umkaSchool.model.Student;

import java.time.LocalDate;

public interface StudentActivityService {
    Long totalAttempts(Student student, LocalDate date);
    Long totalCorrect(Student student, LocalDate date);
    Long totalPracticeSeconds(Student student, LocalDate date);
    Integer currentStreak(Student student, LocalDate date);
}
