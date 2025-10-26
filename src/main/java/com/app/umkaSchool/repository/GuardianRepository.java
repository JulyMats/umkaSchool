package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GuardianRepository extends JpaRepository<Guardian, UUID> {
}

