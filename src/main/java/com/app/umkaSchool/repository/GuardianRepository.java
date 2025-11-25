package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Guardian;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuardianRepository extends JpaRepository<Guardian, UUID> {
    Optional<Guardian> findByEmail(String email);

    boolean existsByEmail(String email);
}