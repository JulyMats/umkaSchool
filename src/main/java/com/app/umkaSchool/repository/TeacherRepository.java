package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, UUID> {
    Optional<Teacher> findByUser_Id(UUID userId);

    Optional<Teacher> findByUser_Email(String email);

    boolean existsByUser_Email(String email);
}

