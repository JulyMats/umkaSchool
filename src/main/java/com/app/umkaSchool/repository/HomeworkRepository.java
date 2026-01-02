package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Homework;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
    @EntityGraph(attributePaths = {"teacher", "teacher.user"})
    List<Homework> findByTeacher_IdOrderByCreatedAtDesc(UUID teacherId);

    @EntityGraph(attributePaths = {"teacher", "teacher.user"})
    List<Homework> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = {"teacher", "teacher.user"})
    Optional<Homework> findByTitle(String title);

    boolean existsByTitle(String title);
}

