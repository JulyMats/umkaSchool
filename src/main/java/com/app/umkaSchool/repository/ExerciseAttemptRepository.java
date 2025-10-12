package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Exercise;
import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, UUID> {
    List<ExerciseAttempt> findByStudent(Student student);
    List<ExerciseAttempt> findByExercise(Exercise exercise);
    List<ExerciseAttempt> findByStudentAndCompletedAtBetween(
        Student student, ZonedDateTime startDate, ZonedDateTime endDate);
    
    @Query("SELECT ea FROM ExerciseAttempt ea WHERE ea.student = ?1 ORDER BY ea.completedAt DESC")
    List<ExerciseAttempt> findRecentAttempts(Student student, int limit);
    
    @Query("SELECT AVG(ea.accuracy) FROM ExerciseAttempt ea WHERE ea.student = ?1")
    Double getAverageAccuracy(Student student);
}