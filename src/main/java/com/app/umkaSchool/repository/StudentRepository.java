package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByUser_Id(UUID userId);

    Optional<Student> findByUser_Email(String email);

    List<Student> findByTeacher_Id(UUID teacherId);

    List<Student> findByGroup_Id(UUID groupId);

    @Query("SELECT s FROM Student s WHERE s.teacher.id = :teacherId ORDER BY s.lastActivityAt DESC")
    List<Student> findByTeacherIdOrderByLastActivityDesc(UUID teacherId);

    @Query("SELECT s FROM Student s WHERE s.group.id = :groupId ORDER BY s.user.lastName, s.user.firstName")
    List<Student> findByGroupIdOrderByName(UUID groupId);

    boolean existsByUser_Email(String email);
}