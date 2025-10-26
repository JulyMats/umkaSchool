package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.StudentGroup;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface StudentGroupRepository extends JpaRepository<StudentGroup, UUID> {
}
