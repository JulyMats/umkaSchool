package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.ProgressSnapshot;
import com.app.umkaSchool.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProgressSnapshotRepository extends JpaRepository<ProgressSnapshot, UUID> {
    @Query("SELECT ps FROM ProgressSnapshot ps JOIN FETCH ps.student s JOIN FETCH s.user WHERE ps.student.id = :studentId AND ps.snapshotDate = :snapshotDate ORDER BY ps.createdAt DESC")
    List<ProgressSnapshot> findAllByStudentIdAndSnapshotDateOrderByCreatedAtDesc(@Param("studentId") UUID studentId, @Param("snapshotDate") LocalDate snapshotDate);
    
    Optional<ProgressSnapshot> findByStudent_IdAndSnapshotDate(UUID studentId, LocalDate snapshotDate);
    
    @Query("SELECT ps FROM ProgressSnapshot ps JOIN FETCH ps.student s JOIN FETCH s.user WHERE ps.student.id = :studentId ORDER BY ps.snapshotDate DESC")
    List<ProgressSnapshot> findByStudent_IdOrderBySnapshotDateDesc(@Param("studentId") UUID studentId);
    
    @Query("SELECT ps FROM ProgressSnapshot ps JOIN FETCH ps.student s JOIN FETCH s.user WHERE ps.student.id = :studentId AND ps.snapshotDate BETWEEN :startDate AND :endDate ORDER BY ps.snapshotDate DESC")
    List<ProgressSnapshot> findByStudentIdAndDateRange(@Param("studentId") UUID studentId, 
                                                        @Param("startDate") LocalDate startDate, 
                                                        @Param("endDate") LocalDate endDate);
    
    @Query("SELECT ps FROM ProgressSnapshot ps JOIN FETCH ps.student s JOIN FETCH s.user WHERE ps.student.id = :studentId AND ps.snapshotDate <= :date ORDER BY ps.snapshotDate DESC")
    List<ProgressSnapshot> findByStudentIdUpToDate(@Param("studentId") UUID studentId, @Param("date") LocalDate date);
}
