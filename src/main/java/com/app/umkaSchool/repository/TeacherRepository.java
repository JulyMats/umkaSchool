package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
}