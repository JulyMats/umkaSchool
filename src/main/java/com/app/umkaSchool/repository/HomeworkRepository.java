package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Homework;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
    List<Homework> findByTeacher_IdOrderByCreatedAtDesc(UUID teacherId);

    List<Homework> findAllByOrderByCreatedAtDesc();

    Optional<Homework> findByTitle(String title);

    boolean existsByTitle(String title);
}

