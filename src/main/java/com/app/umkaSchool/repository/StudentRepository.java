package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.model.StudentGroup;
import com.app.umkaSchool.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByUserEmail(String email);
    List<Student> findByTeacher(Teacher teacher);
    List<Student> findByGroup(StudentGroup group);
    boolean existsByUserEmail(String email);
}