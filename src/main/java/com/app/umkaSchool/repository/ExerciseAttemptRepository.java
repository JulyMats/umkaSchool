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

    // Count completed exercises for a student in a homework assignment using JOIN
    // This joins exercise_attempt -> homework_exercise -> homework_assignment -> (homework_assignment_student OR homework_assignment_student_group)
    @Query("SELECT COUNT(DISTINCT ea.exercise.id) FROM ExerciseAttempt ea " +
           "JOIN HomeworkExercise he ON ea.exercise.id = he.exercise.id " +
           "JOIN HomeworkAssignment ha ON he.homework.id = ha.homework.id " +
           "LEFT JOIN HomeworkAssignmentStudent has ON ha.id = has.homeworkAssignment.id " +
           "LEFT JOIN HomeworkAssignmentStudentGroup hasg ON ha.id = hasg.homeworkAssignment.id " +
           "LEFT JOIN Student s ON s.id = :studentId " +
           "WHERE ha.id = :homeworkAssignmentId " +
           "AND ea.student.id = :studentId " +
           "AND ea.completedAt IS NOT NULL " +
           "AND (has.student.id = :studentId OR hasg.studentGroup.id = s.group.id)")
    Long countCompletedExercises(@Param("homeworkAssignmentId") UUID homeworkAssignmentId,
                                  @Param("studentId") UUID studentId);
}
