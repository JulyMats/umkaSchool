package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.progresssnapshot.ProgressSnapshotResponse;
import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.ProgressSnapshot;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.repository.ExerciseAttemptRepository;
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
    private final ExerciseAttemptRepository exerciseAttemptRepository;

    public ProgressSnapshotServiceImpl(ProgressSnapshotRepository repository, 
                                       StudentActivityService studentActivityService,
                                       StudentRepository studentRepository,
                                       ExerciseAttemptRepository exerciseAttemptRepository) {
        this.repository = repository;
        this.studentActivityService = studentActivityService;
        this.studentRepository = studentRepository;
        this.exerciseAttemptRepository = exerciseAttemptRepository;
    }

    @Override
    @Transactional
    public ProgressSnapshot updateSnapshotAfterSession(Student student, ExerciseAttempt completedAttempt) {
        LocalDate today = LocalDate.now();
        logger.info("=== updateSnapshotAfterSession START ===");
        logger.info("Student: {}, Attempt ID: {}, Date: {}", student.getId(), completedAttempt.getId(), today);
        logger.info("Attempt data - totalAttempts: {}, totalCorrect: {}, startedAt: {}, completedAt: {}", 
            completedAttempt.getTotalAttempts(), completedAttempt.getTotalCorrect(), 
            completedAttempt.getStartedAt(), completedAttempt.getCompletedAt());
        
        // Always create a NEW snapshot for today (never update existing)
        ProgressSnapshot snapshot = new ProgressSnapshot();
        snapshot.setStudent(student);
        snapshot.setSnapshotDate(today);
        
        // Get the latest snapshot (from any date, including today if exists) to get baseline cumulative data
        // This will be the most recent snapshot before this new one
        Optional<ProgressSnapshot> latestSnapshot = getLatestSnapshot(student);
        
        // Initialize with baseline data from latest snapshot if exists
        if (latestSnapshot.isPresent()) {
            ProgressSnapshot baseline = latestSnapshot.get();
            logger.info("Found baseline snapshot - date: {}, totalAttempts: {}, totalCorrect: {}", 
                baseline.getSnapshotDate(), baseline.getTotalAttempts(), baseline.getTotalCorrect());
            snapshot.setTotalAttempts(baseline.getTotalAttempts());
            snapshot.setTotalCorrect(baseline.getTotalCorrect());
            snapshot.setTotalPracticeSeconds(baseline.getTotalPracticeSeconds());
            snapshot.setCurrentStreak(baseline.getCurrentStreak());
        } else {
            logger.info("No baseline snapshot found, starting from zero");
            // No previous snapshot, start from zero
            snapshot.setTotalAttempts(0L);
            snapshot.setTotalCorrect(0L);
            snapshot.setTotalPracticeSeconds(0L);
            snapshot.setCurrentStreak(0);
        }
        
        // Add session data incrementally (baseline data + current session data)
        long sessionAttempts = completedAttempt.getTotalAttempts() != null ? completedAttempt.getTotalAttempts() : 0L;
        long sessionCorrect = completedAttempt.getTotalCorrect() != null ? completedAttempt.getTotalCorrect() : 0L;
        long sessionSeconds = 0L;
        if (completedAttempt.getStartedAt() != null && completedAttempt.getCompletedAt() != null) {
            sessionSeconds = java.time.Duration.between(
                completedAttempt.getStartedAt(), 
                completedAttempt.getCompletedAt()
            ).getSeconds();
        }
        
        logger.info("Session data - attempts: {}, correct: {}, seconds: {}", sessionAttempts, sessionCorrect, sessionSeconds);
        
        // Add session data to baseline data
        snapshot.setTotalAttempts(snapshot.getTotalAttempts() + sessionAttempts);
        snapshot.setTotalCorrect(snapshot.getTotalCorrect() + sessionCorrect);
        snapshot.setTotalPracticeSeconds(snapshot.getTotalPracticeSeconds() + sessionSeconds);
        
        // Recalculate streak based on all attempts up to today
        Integer streak = studentActivityService.currentStreak(student, today);
        snapshot.setCurrentStreak(streak != null ? streak : 0);

        logger.info("Final snapshot data - totalAttempts: {}, totalCorrect: {}, totalPracticeSeconds: {}, currentStreak: {}", 
            snapshot.getTotalAttempts(), snapshot.getTotalCorrect(), snapshot.getTotalPracticeSeconds(), snapshot.getCurrentStreak());
        
        // Always save as new snapshot (creates new record)
        ProgressSnapshot saved = repository.save(snapshot);
        logger.info("Snapshot saved successfully with ID: {}", saved.getId());
        logger.info("=== updateSnapshotAfterSession END ===");
        return saved;
    }

    @Override
    @Transactional
    public ProgressSnapshot createOrUpdateTodaySnapshot(Student student) {
        LocalDate today = LocalDate.now();
        Optional<ProgressSnapshot> existing = getLatestSnapshotForDate(student, today);
        
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
                ProgressSnapshot existingSnap = getLatestSnapshotForDate(student, today)
                        .orElseThrow(() -> e);
                updateSnapshotFromActivity(existingSnap, student, today);
                return repository.save(existingSnap);
            }
        }
    }

    @Override
    @Transactional
    public ProgressSnapshot createOrUpdateSnapshotForDate(Student student, LocalDate date) {
        Optional<ProgressSnapshot> existing = getLatestSnapshotForDate(student, date);
        
        if (existing.isPresent()) {
            ProgressSnapshot snapshot = existing.get();
            updateSnapshotFromActivity(snapshot, student, date);
            return repository.save(snapshot);
        } else {
            ProgressSnapshot snap = buildSnapshotFromActivity(student, date);
            try {
                return repository.save(snap);
            } catch (DataIntegrityViolationException e) {
                ProgressSnapshot existingSnap = getLatestSnapshotForDate(student, date)
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
                Optional<ProgressSnapshot> existing = getLatestSnapshotForDate(student, today);
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
    @Transactional
    public void cleanupYesterdaySnapshots() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        logger.info("Starting cleanup of duplicate snapshots for date: {}", yesterday);
        
        List<Student> students = studentRepository.findAll();
        int cleaned = 0;
        int skipped = 0;
        
        for (Student student : students) {
            try {
                // Check if there were any attempts completed yesterday
                List<ExerciseAttempt> attemptsYesterday = exerciseAttemptRepository
                    .findByStudent_IdOrderByCompletedAtDesc(student.getId())
                    .stream()
                    .filter(attempt -> {
                        if (attempt.getCompletedAt() == null) return false;
                        LocalDate attemptDate = attempt.getCompletedAt().toLocalDate();
                        return attemptDate.equals(yesterday);
                    })
                    .collect(Collectors.toList());
                
                // If no attempts yesterday, skip cleanup for this student
                if (attemptsYesterday.isEmpty()) {
                    skipped++;
                    continue;
                }
                
                // Get all snapshots for yesterday
                List<ProgressSnapshot> snapshotsYesterday = repository
                    .findByStudentIdAndDateRange(student.getId(), yesterday, yesterday);
                
                // If there's only one or zero snapshots, nothing to clean
                if (snapshotsYesterday.size() <= 1) {
                    skipped++;
                    continue;
                }
                
                // Sort by created_at descending to get the latest one
                snapshotsYesterday.sort((a, b) -> {
                    if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
                    if (a.getCreatedAt() == null) return 1;
                    if (b.getCreatedAt() == null) return -1;
                    return b.getCreatedAt().compareTo(a.getCreatedAt());
                });
                
                // Keep the latest snapshot, delete the rest
                ProgressSnapshot latest = snapshotsYesterday.get(0);
                for (int i = 1; i < snapshotsYesterday.size(); i++) {
                    repository.delete(snapshotsYesterday.get(i));
                    cleaned++;
                }
                
                logger.debug("Cleaned up {} duplicate snapshots for student {} on {}", 
                    snapshotsYesterday.size() - 1, student.getId(), yesterday);
            } catch (Exception e) {
                logger.error("Error cleaning up snapshots for student {}: {}", student.getId(), e.getMessage());
            }
        }
        
        logger.info("Cleanup completed: {} snapshots deleted, {} students skipped", cleaned, skipped);
    }

    @Override
    public Optional<ProgressSnapshot> getLatestSnapshot(Student student) {
        List<ProgressSnapshot> snapshots = repository.findByStudent_IdOrderBySnapshotDateDesc(student.getId());
        if (snapshots.isEmpty()) {
            return Optional.empty();
        }
        // Sort by date descending, then by created_at descending to get the most recent snapshot
        snapshots.sort((a, b) -> {
            int dateCompare = b.getSnapshotDate().compareTo(a.getSnapshotDate());
            if (dateCompare != 0) return dateCompare;
            // If same date, compare by created_at
            if (a.getCreatedAt() == null && b.getCreatedAt() == null) return 0;
            if (a.getCreatedAt() == null) return 1;
            if (b.getCreatedAt() == null) return -1;
            return b.getCreatedAt().compareTo(a.getCreatedAt());
        });
        return Optional.of(snapshots.get(0));
    }

    @Override
    public Optional<ProgressSnapshot> getSnapshotForDate(Student student, LocalDate date) {
        return getLatestSnapshotForDate(student, date);
    }
    
    /**
     * Helper method to get the latest snapshot for a student and date.
     * Handles multiple snapshots per day by returning the most recent one.
     */
    private Optional<ProgressSnapshot> getLatestSnapshotForDate(Student student, LocalDate date) {
        // Get list of snapshots for the date, ordered by created_at DESC
        List<ProgressSnapshot> snapshots = repository.findAllByStudentIdAndSnapshotDateOrderByCreatedAtDesc(student.getId(), date);
        return snapshots.isEmpty() ? Optional.empty() : Optional.of(snapshots.get(0));
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

    private Optional<ProgressSnapshot> getLatestSnapshotBeforeDate(Student student, LocalDate date) {
        List<ProgressSnapshot> snapshots = repository.findByStudent_IdOrderBySnapshotDateDesc(student.getId());
        return snapshots.stream()
            .filter(s -> s.getSnapshotDate().isBefore(date))
            .findFirst();
    }

    @Override
    public com.app.umkaSchool.dto.stats.StatsResponse getStudentStats(Student student, String period) {
        logger.info("Getting stats for student: {}, period: {}", student.getId(), period);
        
        LocalDate today = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate = today;

        long periodProblemsSolved = 0;
        long periodPracticeSeconds = 0;
        long periodTotalCorrect = 0;
        long periodTotalAttempts = 0;

        if (period.equalsIgnoreCase("all")) {
            // For "all", use the latest snapshot (latest date, latest time by created_at)
            Optional<ProgressSnapshot> latestSnapshotOpt = getLatestSnapshot(student);
            if (latestSnapshotOpt.isPresent()) {
                ProgressSnapshot latestSnapshot = latestSnapshotOpt.get();
                periodProblemsSolved = latestSnapshot.getTotalAttempts();
                periodPracticeSeconds = latestSnapshot.getTotalPracticeSeconds();
                periodTotalCorrect = latestSnapshot.getTotalCorrect();
                periodTotalAttempts = latestSnapshot.getTotalAttempts();
                logger.info("Using latest snapshot for 'all': date={}, created_at={}, totalAttempts={}, totalCorrect={}", 
                    latestSnapshot.getSnapshotDate(), latestSnapshot.getCreatedAt(),
                    latestSnapshot.getTotalAttempts(), latestSnapshot.getTotalCorrect());
            }
        } else {
            // For period-specific stats, calculate difference between latest snapshot and baseline
            // Always use the latest snapshot (today, most recent by created_at) as period end
            Optional<ProgressSnapshot> latestSnapshotOpt = getLatestSnapshot(student);
            ProgressSnapshotResponse periodEndSnapshot = null;
            
            if (latestSnapshotOpt.isPresent()) {
                periodEndSnapshot = mapToResponse(latestSnapshotOpt.get());
                logger.info("Using latest snapshot as period end: date={}, created_at={}, totalAttempts={}, totalCorrect={}", 
                    latestSnapshotOpt.get().getSnapshotDate(), latestSnapshotOpt.get().getCreatedAt(),
                    latestSnapshotOpt.get().getTotalAttempts(), latestSnapshotOpt.get().getTotalCorrect());
            }

            if (periodEndSnapshot != null) {
                // Find the baseline snapshot (last snapshot before period starts)
                LocalDate baselineDate;
                switch (period.toLowerCase()) {
                    case "day":
                        // For "day", baseline is yesterday
                        baselineDate = today.minusDays(1);
                        break;
                    case "week":
                        // For "week", baseline is 7 days ago (or first day of week)
                        baselineDate = today.minusDays(7);
                        break;
                    case "month":
                        // For "month", baseline is 1 month ago
                        baselineDate = today.minusMonths(1);
                        break;
                    default:
                        baselineDate = null;
                        break;
                }

                ProgressSnapshotResponse baselineSnapshot = null;
                if (baselineDate != null) {
                    // Get the latest snapshot for the baseline date
                    Optional<ProgressSnapshot> baselineSnapshotOpt = getSnapshotForDate(student, baselineDate);
                    if (baselineSnapshotOpt.isPresent()) {
                        baselineSnapshot = mapToResponse(baselineSnapshotOpt.get());
                        logger.info("Found baseline snapshot for date {}: totalAttempts={}, totalCorrect={}", 
                            baselineDate, baselineSnapshot.getTotalAttempts(), baselineSnapshot.getTotalCorrect());
                    } else {
                        // If no snapshot for exact date, find the latest snapshot before baseline date
                        List<ProgressSnapshotResponse> allSnapshots = getSnapshotsByStudentId(student.getId());
                        baselineSnapshot = allSnapshots.stream()
                            .filter(s -> s.getSnapshotDate().isBefore(baselineDate.plusDays(1)))
                            .findFirst()
                            .orElse(null);
                        if (baselineSnapshot != null) {
                            logger.info("Found baseline snapshot before date {}: date={}, totalAttempts={}, totalCorrect={}", 
                                baselineDate, baselineSnapshot.getSnapshotDate(), 
                                baselineSnapshot.getTotalAttempts(), baselineSnapshot.getTotalCorrect());
                        }
                    }
                }

                // Calculate difference: latest snapshot - baseline snapshot (or 0)
                long baselineAttempts = baselineSnapshot != null ? baselineSnapshot.getTotalAttempts() : 0;
                long baselineCorrect = baselineSnapshot != null ? baselineSnapshot.getTotalCorrect() : 0;
                long baselineSeconds = baselineSnapshot != null ? baselineSnapshot.getTotalPracticeSeconds() : 0;

                periodProblemsSolved = periodEndSnapshot.getTotalAttempts() - baselineAttempts;
                periodPracticeSeconds = periodEndSnapshot.getTotalPracticeSeconds() - baselineSeconds;
                periodTotalCorrect = periodEndSnapshot.getTotalCorrect() - baselineCorrect;
                periodTotalAttempts = periodEndSnapshot.getTotalAttempts() - baselineAttempts;
                
                logger.info("Calculated period stats for {}: problemsSolved={}, totalCorrect={}, totalAttempts={}, accuracy={}%", 
                    period, periodProblemsSolved, periodTotalCorrect, periodTotalAttempts,
                    periodTotalAttempts > 0 ? (periodTotalCorrect * 100 / periodTotalAttempts) : 0);
            }
        }

        // Calculate accuracy: (totalCorrect / totalAttempts) * 100
        int accuracyRate = periodTotalAttempts > 0 
            ? (int) Math.round((double) periodTotalCorrect / periodTotalAttempts * 100.0)
            : 0;

        // Calculate streak (using StudentActivityService)
        Integer currentStreak = studentActivityService.currentStreak(student, today);
        Integer bestStreak = calculateBestStreak(student);

        // Format time
        String totalPracticeTime = formatTime(periodPracticeSeconds);

        return com.app.umkaSchool.dto.stats.StatsResponse.builder()
            .totalPracticeTime(totalPracticeTime)
            .problemsSolved(Math.max(0, periodProblemsSolved))
            .accuracyRate(Math.max(0, accuracyRate))
            .currentStreak(currentStreak != null ? currentStreak : 0)
            .bestStreak(bestStreak != null ? bestStreak : 0)
            .build();
    }

    private Integer calculateBestStreak(Student student) {
        List<ExerciseAttempt> attempts = 
            exerciseAttemptRepository.findByStudent_IdOrderByCompletedAtDesc(student.getId());

        // Get unique dates when exercises were completed
        java.util.Set<LocalDate> completedDates = attempts.stream()
            .filter(attempt -> attempt.getCompletedAt() != null)
            .map(attempt -> attempt.getCompletedAt().toLocalDate())
            .collect(java.util.stream.Collectors.toSet());

        if (completedDates.isEmpty()) {
            return 0;
        }

        // Sort dates descending
        java.util.List<LocalDate> sortedDates = completedDates.stream()
            .sorted(java.util.Collections.reverseOrder())
            .collect(java.util.stream.Collectors.toList());

        // Calculate best streak
        int bestStreak = 1;
        int tempStreak = 1;

        for (int i = 1; i < sortedDates.size(); i++) {
            LocalDate prevDate = sortedDates.get(i - 1);
            LocalDate currDate = sortedDates.get(i);
            
            long daysDiff = java.time.temporal.ChronoUnit.DAYS.between(currDate, prevDate);
            if (daysDiff == 1) {
                tempStreak++;
                bestStreak = Math.max(bestStreak, tempStreak);
            } else {
                tempStreak = 1;
            }
        }

        return bestStreak;
    }

    private String formatTime(long seconds) {
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        }
        return String.format("%dm", minutes);
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
