package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Homework;
import com.app.umkaSchool.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
    List<Homework> findByTeacher(Teacher teacher);
    List<Homework> findByTeacherOrderByCreatedAtDesc(Teacher teacher);
}