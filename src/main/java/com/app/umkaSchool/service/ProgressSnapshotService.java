package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.progresssnapshot.ProgressSnapshotResponse;
import com.app.umkaSchool.model.ProgressSnapshot;
import com.app.umkaSchool.model.Student;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProgressSnapshotService {
    /**
     * Create or update snapshot for today. Used when exercise is completed.
     */
    ProgressSnapshot createOrUpdateTodaySnapshot(Student student);

    /**
     * Create snapshot for given date (used by scheduled job). If exists, updates it.
     */
    ProgressSnapshot createOrUpdateSnapshotForDate(Student student, LocalDate date);

    /**
     * Create snapshots for all students for today (scheduled job)
     */
    void createSnapshotsForAllStudentsToday();

    /**
     * Get latest snapshot for a student
     */
    Optional<ProgressSnapshot> getLatestSnapshot(Student student);

    /**
     * Get snapshot for a specific date
     */
    Optional<ProgressSnapshot> getSnapshotForDate(Student student, LocalDate date);

    /**
     * Get all snapshots for a student
     */
    List<ProgressSnapshotResponse> getSnapshotsByStudentId(UUID studentId);

    /**
     * Get snapshots for a student within a date range
     */
    List<ProgressSnapshotResponse> getSnapshotsByDateRange(UUID studentId, LocalDate startDate, LocalDate endDate);
}
