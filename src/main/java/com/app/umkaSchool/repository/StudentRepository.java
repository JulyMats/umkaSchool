package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
}



