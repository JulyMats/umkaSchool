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
     * Create or update snapshot for today by incrementally adding session data.
     * Used when exercise attempt is completed.
     * Adds session data (from the completed attempt) to existing snapshot data.
     */
    ProgressSnapshot updateSnapshotAfterSession(Student student, com.app.umkaSchool.model.ExerciseAttempt completedAttempt);

    /**
     * Create or update snapshot for today. Used when exercise is completed.
     * @deprecated Use updateSnapshotAfterSession instead for incremental updates
     */
    @Deprecated
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
     * Cleanup duplicate snapshots from yesterday: delete all except the last one if there were new attempts.
     * Runs at 1 AM to consolidate yesterday's snapshots.
     */
    void cleanupYesterdaySnapshots();

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

    /**
     * Get student statistics for a specific time period
     * @param student Student entity
     * @param period Time period: "day", "week", "month", or "all"
     * @return Statistics response with calculated metrics
     */
    com.app.umkaSchool.dto.stats.StatsResponse getStudentStats(Student student, String period);
}
