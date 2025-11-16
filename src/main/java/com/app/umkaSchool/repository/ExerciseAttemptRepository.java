package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ExerciseAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ExerciseAttemptRepository extends JpaRepository<ExerciseAttempt, UUID> {
    @Query("SELECT ea FROM ExerciseAttempt ea JOIN FETCH ea.student s JOIN FETCH s.user JOIN FETCH ea.exercise e JOIN FETCH e.exerciseType WHERE ea.student.id = :studentId ORDER BY ea.completedAt DESC")
    List<ExerciseAttempt> findByStudent_IdOrderByCompletedAtDesc(@Param("studentId") UUID studentId);
    
    List<ExerciseAttempt> findByExercise_IdOrderByCompletedAtDesc(UUID exerciseId);
    List<ExerciseAttempt> findByStudent_IdAndExercise_IdOrderByCompletedAtDesc(UUID studentId, UUID exerciseId);
    Long countByStudent_Id(UUID studentId);
}
