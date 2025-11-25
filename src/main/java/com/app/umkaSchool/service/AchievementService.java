package com.app.umkaSchool.service;

import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.Student;

public interface AchievementService {
    /**
     * Checks if student has earned any achievements based on the completed attempt
     * and awards them if conditions are met.
     * 
     * @param student The student who completed the attempt
     * @param attempt The completed exercise attempt
     */
    void checkAndAward(Student student, ExerciseAttempt attempt);
}


