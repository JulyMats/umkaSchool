package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Homework;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface HomeworkRepository extends JpaRepository<Homework, UUID> {
}

