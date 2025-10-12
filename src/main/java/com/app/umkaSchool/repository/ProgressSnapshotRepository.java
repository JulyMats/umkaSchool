package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ProgressSnapshot;
import com.app.umkaSchool.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressSnapshotRepository extends JpaRepository<ProgressSnapshot, UUID> {
    List<ProgressSnapshot> findByStudent(Student student);
    List<ProgressSnapshot> findByStudentAndSnapshotDateBetween(
        Student student, LocalDate startDate, LocalDate endDate);
    Optional<ProgressSnapshot> findByStudentAndSnapshotDate(Student student, LocalDate date);
    
    @Query("SELECT MAX(ps.currentStreak) FROM ProgressSnapshot ps WHERE ps.student = ?1")
    Integer getMaxStreak(Student student);
    
    @Query("SELECT AVG(ps.accuracyPercent) FROM ProgressSnapshot ps WHERE ps.student = ?1")
    Double getAverageAccuracy(Student student);
}