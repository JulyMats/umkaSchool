package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ProgressSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ProgressSnapshotRepository extends JpaRepository<ProgressSnapshot, UUID> {
}
