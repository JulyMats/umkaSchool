package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.StudentGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentGroupRepository extends JpaRepository<StudentGroup, UUID> {
    Optional<StudentGroup> findByCode(String code);

    List<StudentGroup> findByTeacher_Id(UUID teacherId);

    boolean existsByCode(String code);

    boolean existsByName(String name);
}

