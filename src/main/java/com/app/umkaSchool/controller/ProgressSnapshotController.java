package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.progresssnapshot.ProgressSnapshotResponse;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.repository.StudentRepository;
import com.app.umkaSchool.service.ProgressSnapshotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/progress-snapshots")
public class ProgressSnapshotController {

    private final ProgressSnapshotService progressSnapshotService;
    private final StudentRepository studentRepository;

    @Autowired
    public ProgressSnapshotController(ProgressSnapshotService progressSnapshotService,
                                      StudentRepository studentRepository) {
        this.progressSnapshotService = progressSnapshotService;
        this.studentRepository = studentRepository;
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ProgressSnapshotResponse>> getSnapshotsByStudent(
            @PathVariable UUID studentId) {
        List<ProgressSnapshotResponse> snapshots = progressSnapshotService.getSnapshotsByStudentId(studentId);
        return ResponseEntity.ok(snapshots);
    }

    @GetMapping("/student/{studentId}/latest")
    public ResponseEntity<ProgressSnapshotResponse> getLatestSnapshot(
            @PathVariable UUID studentId) {
        List<ProgressSnapshotResponse> responses = progressSnapshotService.getSnapshotsByStudentId(studentId);
        if (responses.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(responses.get(0)); // First one is latest (ordered desc)
    }

    @GetMapping("/student/{studentId}/date-range")
    public ResponseEntity<List<ProgressSnapshotResponse>> getSnapshotsByDateRange(
            @PathVariable UUID studentId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<ProgressSnapshotResponse> snapshots = progressSnapshotService.getSnapshotsByDateRange(studentId, startDate, endDate);
        return ResponseEntity.ok(snapshots);
    }

    @GetMapping("/student/{studentId}/date/{date}")
    public ResponseEntity<ProgressSnapshotResponse> getSnapshotByDate(
            @PathVariable UUID studentId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return studentRepository.findById(studentId)
                .map(student -> progressSnapshotService.getSnapshotForDate(student, date)
                        .map(snapshot -> {
                            // Convert to response directly
                            Student studentEntity = snapshot.getStudent();
                            String studentName = studentEntity.getUser().getFirstName() + " " + studentEntity.getUser().getLastName();
                            
                            ProgressSnapshotResponse response = ProgressSnapshotResponse.builder()
                                    .snapshotId(snapshot.getId())
                                    .studentId(studentEntity.getId())
                                    .studentName(studentName)
                                    .snapshotDate(snapshot.getSnapshotDate())
                                    .totalAttempts(snapshot.getTotalAttempts())
                                    .totalCorrect(snapshot.getTotalCorrect())
                                    .totalPracticeSeconds(snapshot.getTotalPracticeSeconds())
                                    .currentStreak(snapshot.getCurrentStreak())
                                    .createdAt(snapshot.getCreatedAt())
                                    .build();
                            
                            return ResponseEntity.ok(response);
                        })
                        .orElse(ResponseEntity.notFound().build()))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/student/{studentId}/stats")
    public ResponseEntity<com.app.umkaSchool.dto.stats.StatsResponse> getStudentStats(
            @PathVariable UUID studentId,
            @RequestParam(defaultValue = "all") String period) {
        
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Validate period parameter
        if (!isValidPeriod(period)) {
            return ResponseEntity.badRequest().build();
        }

        com.app.umkaSchool.dto.stats.StatsResponse stats = progressSnapshotService.getStudentStats(student, period);
        return ResponseEntity.ok(stats);
    }

    private boolean isValidPeriod(String period) {
        return period != null && (
            period.equalsIgnoreCase("day") ||
            period.equalsIgnoreCase("week") ||
            period.equalsIgnoreCase("month") ||
            period.equalsIgnoreCase("all")
        );
    }
}

