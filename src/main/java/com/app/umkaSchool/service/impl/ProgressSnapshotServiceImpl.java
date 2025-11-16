package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.progresssnapshot.ProgressSnapshotResponse;
import com.app.umkaSchool.model.ProgressSnapshot;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.repository.ProgressSnapshotRepository;
import com.app.umkaSchool.repository.StudentRepository;
import com.app.umkaSchool.service.ProgressSnapshotService;
import com.app.umkaSchool.service.StudentActivityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProgressSnapshotServiceImpl implements ProgressSnapshotService {
    private static final Logger logger = LoggerFactory.getLogger(ProgressSnapshotServiceImpl.class);
    private final ProgressSnapshotRepository repository;
    private final StudentActivityService studentActivityService;
    private final StudentRepository studentRepository;

    public ProgressSnapshotServiceImpl(ProgressSnapshotRepository repository, 
                                       StudentActivityService studentActivityService,
                                       StudentRepository studentRepository) {
        this.repository = repository;
        this.studentActivityService = studentActivityService;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public ProgressSnapshot createOrUpdateTodaySnapshot(Student student) {
        LocalDate today = LocalDate.now();
        Optional<ProgressSnapshot> existing = repository.findByStudentAndSnapshotDate(student, today);
        
        if (existing.isPresent()) {
            // Update existing snapshot
            ProgressSnapshot snapshot = existing.get();
            updateSnapshotFromActivity(snapshot, student, today);
            return repository.save(snapshot);
        } else {
            // Create new snapshot
            ProgressSnapshot snap = buildSnapshotFromActivity(student, today);
            try {
                return repository.save(snap);
            } catch (DataIntegrityViolationException e) {
                // Concurrent insert: another thread created snapshot for same student/date
                ProgressSnapshot existingSnap = repository.findByStudentAndSnapshotDate(student, today)
                        .orElseThrow(() -> e);
                updateSnapshotFromActivity(existingSnap, student, today);
                return repository.save(existingSnap);
            }
        }
    }

    @Override
    @Transactional
    public ProgressSnapshot createOrUpdateSnapshotForDate(Student student, LocalDate date) {
        Optional<ProgressSnapshot> existing = repository.findByStudentAndSnapshotDate(student, date);
        
        if (existing.isPresent()) {
            ProgressSnapshot snapshot = existing.get();
            updateSnapshotFromActivity(snapshot, student, date);
            return repository.save(snapshot);
        } else {
            ProgressSnapshot snap = buildSnapshotFromActivity(student, date);
            try {
                return repository.save(snap);
            } catch (DataIntegrityViolationException e) {
                ProgressSnapshot existingSnap = repository.findByStudentAndSnapshotDate(student, date)
                        .orElseThrow(() -> e);
                updateSnapshotFromActivity(existingSnap, student, date);
                return repository.save(existingSnap);
            }
        }
    }

    @Override
    @Transactional
    public void createSnapshotsForAllStudentsToday() {
        LocalDate today = LocalDate.now();
        logger.info("Creating progress snapshots for all students for date: {}", today);
        
        List<Student> students = studentRepository.findAll();
        int created = 0;
        int updated = 0;
        
        for (Student student : students) {
            try {
                Optional<ProgressSnapshot> existing = repository.findByStudentAndSnapshotDate(student, today);
                if (existing.isPresent()) {
                    updateSnapshotFromActivity(existing.get(), student, today);
                    repository.save(existing.get());
                    updated++;
                } else {
                    ProgressSnapshot snap = buildSnapshotFromActivity(student, today);
                    repository.save(snap);
                    created++;
                }
            } catch (Exception e) {
                logger.error("Error creating snapshot for student {}: {}", student.getId(), e.getMessage());
            }
        }
        
        logger.info("Progress snapshots created: {}, updated: {}", created, updated);
    }

    @Override
    public Optional<ProgressSnapshot> getLatestSnapshot(Student student) {
        List<ProgressSnapshot> snapshots = repository.findByStudent_IdOrderBySnapshotDateDesc(student.getId());
        return snapshots.isEmpty() ? Optional.empty() : Optional.of(snapshots.get(0));
    }

    @Override
    public Optional<ProgressSnapshot> getSnapshotForDate(Student student, LocalDate date) {
        return repository.findByStudentAndSnapshotDate(student, date);
    }

    @Override
    public List<ProgressSnapshotResponse> getSnapshotsByStudentId(UUID studentId) {
        // Use query with JOIN FETCH to avoid lazy loading issues
        List<ProgressSnapshot> snapshots = repository.findByStudent_IdOrderBySnapshotDateDesc(studentId);
        return snapshots.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProgressSnapshotResponse> getSnapshotsByDateRange(UUID studentId, LocalDate startDate, LocalDate endDate) {
        List<ProgressSnapshot> snapshots = repository.findByStudentIdAndDateRange(studentId, startDate, endDate);
        return snapshots.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProgressSnapshot buildSnapshotFromActivity(Student student, LocalDate date) {
        ProgressSnapshot s = new ProgressSnapshot();
        s.setStudent(student);
        s.setSnapshotDate(date);
        updateSnapshotFromActivity(s, student, date);
        return s;
    }

    private void updateSnapshotFromActivity(ProgressSnapshot snapshot, Student student, LocalDate date) {
        // Use aggregated counters from StudentActivityService
        Long attempts = studentActivityService.totalAttempts(student, date);
        Long correct = studentActivityService.totalCorrect(student, date);
        Long practiceSeconds = studentActivityService.totalPracticeSeconds(student, date);
        Integer streak = studentActivityService.currentStreak(student, date);

        snapshot.setTotalAttempts(attempts == null ? 0L : attempts);
        snapshot.setTotalCorrect(correct == null ? 0L : correct);
        snapshot.setTotalPracticeSeconds(practiceSeconds == null ? 0L : practiceSeconds);
        snapshot.setCurrentStreak(streak == null ? 0 : streak);
    }

    private ProgressSnapshotResponse mapToResponse(ProgressSnapshot snapshot) {
        Student student = snapshot.getStudent();
        String studentName = student.getUser().getFirstName() + " " + student.getUser().getLastName();
        
        return ProgressSnapshotResponse.builder()
                .snapshotId(snapshot.getId())
                .studentId(student.getId())
                .studentName(studentName)
                .snapshotDate(snapshot.getSnapshotDate())
                .totalAttempts(snapshot.getTotalAttempts())
                .totalCorrect(snapshot.getTotalCorrect())
                .totalPracticeSeconds(snapshot.getTotalPracticeSeconds())
                .currentStreak(snapshot.getCurrentStreak())
                .createdAt(snapshot.getCreatedAt())
                .build();
    }
}
