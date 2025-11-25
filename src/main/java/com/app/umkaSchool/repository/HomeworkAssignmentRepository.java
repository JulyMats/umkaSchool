package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.HomeworkAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface HomeworkAssignmentRepository extends JpaRepository<HomeworkAssignment, UUID> {

    List<HomeworkAssignment> findByHomework_Id(UUID homeworkId);

    List<HomeworkAssignment> findByTeacher_Id(UUID teacherId);

    List<HomeworkAssignment> findByStatusOrderByDueDateAsc(com.app.umkaSchool.model.enums.HomeworkStatus status);

    List<HomeworkAssignment> findByDueDateBeforeAndStatus(ZonedDateTime date, com.app.umkaSchool.model.enums.HomeworkStatus status);

    List<HomeworkAssignment> findByAssignedGroups_StudentGroup_Id(UUID groupId);

    List<HomeworkAssignment> findByAssignedStudents_Student_Id(UUID studentId);

    boolean existsByHomework_IdAndAssignedGroups_StudentGroup_Id(UUID homeworkId, UUID groupId);

    boolean existsByHomework_IdAndAssignedStudents_Student_Id(UUID homeworkId, UUID studentId);

    /**
     * Find all homework assignments for a student including:
     * 1. Assignments directly assigned to the student
     * 2. Assignments assigned to the student's group
     */
    @Query("SELECT DISTINCT ha FROM HomeworkAssignment ha " +
           "LEFT JOIN ha.assignedStudents ast " +
           "LEFT JOIN ha.assignedGroups ag " +
           "LEFT JOIN Student s ON s.id = :studentId " +
           "WHERE ast.student.id = :studentId " +
           "OR ag.studentGroup.id = s.group.id")
    List<HomeworkAssignment> findAllByStudentIdIncludingGroup(@Param("studentId") UUID studentId);

    /**
     * Find all homework assignments that contain a specific exercise and are assigned to a student
     * JOIN: homework_assignment -> homework -> homework_exercise -> exercise
     * AND: homework_assignment -> homework_assignment_student -> student
     */
    @Query("SELECT DISTINCT ha FROM HomeworkAssignment ha " +
           "JOIN ha.homework h " +
           "JOIN h.exercises he " +
           "LEFT JOIN ha.assignedStudents ast " +
           "LEFT JOIN ha.assignedGroups ag " +
           "LEFT JOIN Student s ON s.id = :studentId " +
           "WHERE he.exercise.id = :exerciseId " +
           "AND (ast.student.id = :studentId OR ag.studentGroup.id = s.group.id)")
    List<HomeworkAssignment> findByExerciseIdAndStudentId(@Param("exerciseId") UUID exerciseId,
                                                            @Param("studentId") UUID studentId);
}
