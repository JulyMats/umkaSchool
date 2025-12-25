package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.stats.StatsResponse;
import com.app.umkaSchool.dto.weeklyreport.WeeklyReportData;
import com.app.umkaSchool.model.ExerciseAttempt;
import com.app.umkaSchool.model.HomeworkAssignment;
import com.app.umkaSchool.model.HomeworkAssignmentStudent;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.model.enums.HomeworkStatus;
import com.app.umkaSchool.repository.ExerciseAttemptRepository;
import com.app.umkaSchool.repository.HomeworkAssignmentRepository;
import com.app.umkaSchool.repository.HomeworkAssignmentStudentRepository;
import com.app.umkaSchool.repository.StudentRepository;
import com.app.umkaSchool.service.EmailService;
import com.app.umkaSchool.service.ProgressSnapshotService;
import com.app.umkaSchool.service.WeeklyReportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.UUID;
import java.util.Optional;

@Service
public class WeeklyReportServiceImpl implements WeeklyReportService {
    private static final Logger logger = LoggerFactory.getLogger(WeeklyReportServiceImpl.class);
    
    private final StudentRepository studentRepository;
    private final ExerciseAttemptRepository exerciseAttemptRepository;
    private final HomeworkAssignmentRepository homeworkAssignmentRepository;
    private final HomeworkAssignmentStudentRepository homeworkAssignmentStudentRepository;
    private final ProgressSnapshotService progressSnapshotService;
    private final EmailService emailService;
    
    @Autowired
    public WeeklyReportServiceImpl(
            StudentRepository studentRepository,
            ExerciseAttemptRepository exerciseAttemptRepository,
            HomeworkAssignmentRepository homeworkAssignmentRepository,
            HomeworkAssignmentStudentRepository homeworkAssignmentStudentRepository,
            ProgressSnapshotService progressSnapshotService,
            EmailService emailService) {
        this.studentRepository = studentRepository;
        this.exerciseAttemptRepository = exerciseAttemptRepository;
        this.homeworkAssignmentRepository = homeworkAssignmentRepository;
        this.homeworkAssignmentStudentRepository = homeworkAssignmentStudentRepository;
        this.progressSnapshotService = progressSnapshotService;
        this.emailService = emailService;
    }
    
    @Override
    @Transactional(readOnly = true)
    public WeeklyReportData generateWeeklyReport(UUID studentId, LocalDate weekStartDate, LocalDate weekEndDate) {
        logger.info("Generating weekly report for student {} from {} to {}", studentId, weekStartDate, weekEndDate);
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));
        
        ZonedDateTime weekStart = weekStartDate.atStartOfDay(ZoneId.systemDefault());
        ZonedDateTime weekEnd = weekEndDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault());
        
        List<ExerciseAttempt> attempts = exerciseAttemptRepository.findByStudent_IdOrderByCompletedAtDesc(studentId)
                .stream()
                .filter(attempt -> attempt.getCompletedAt() != null 
                        && attempt.getCompletedAt().isAfter(weekStart.minusSeconds(1))
                        && attempt.getCompletedAt().isBefore(weekEnd.plusSeconds(1)))
                .collect(Collectors.toList());
        
        long totalProblemsSolved = attempts.stream()
                .mapToLong(attempt -> attempt.getTotalAttempts() != null ? attempt.getTotalAttempts() : 0L)
                .sum();
        
        long totalCorrect = attempts.stream()
                .mapToLong(attempt -> attempt.getTotalCorrect() != null ? attempt.getTotalCorrect() : 0L)
                .sum();
        
        int accuracyRate = totalProblemsSolved > 0 
                ? (int) Math.round((double) totalCorrect * 100.0 / totalProblemsSolved)
                : 0;
        
        long totalPracticeTimeSeconds = attempts.stream()
                .mapToLong(attempt -> {
                    if (attempt.getStartedAt() != null && attempt.getCompletedAt() != null) {
                        return java.time.Duration.between(
                                attempt.getStartedAt(), 
                                attempt.getCompletedAt()
                        ).getSeconds();
                    }
                    return 0L;
                })
                .sum();
        
        StatsResponse stats = progressSnapshotService.getStudentStats(student, "week");
        int currentStreak = stats.getCurrentStreak() != null ? stats.getCurrentStreak() : 0;
        
        List<HomeworkAssignment> allAssignments = homeworkAssignmentRepository.findAllByStudentIdIncludingGroup(studentId);
        
        int completedHomeworkCount = 0;
        int totalHomeworkCount = 0;
        
        for (HomeworkAssignment assignment : allAssignments) {
            if (assignment.getAssignedAt() != null && assignment.getAssignedAt().isAfter(weekEnd)) {
                continue;
            }
            totalHomeworkCount++;
            
            Optional<HomeworkAssignmentStudent> assignmentStudentOpt = 
                    homeworkAssignmentStudentRepository.findById_HomeworkAssignmentIdAndId_StudentId(
                            assignment.getId(), studentId);
            
            if (assignmentStudentOpt.isPresent() && 
                    assignmentStudentOpt.get().getStatus() == HomeworkStatus.COMPLETED) {
                completedHomeworkCount++;
                logger.debug("Found completed homework assignment {} for student {}", 
                        assignment.getId(), studentId);
            }
        }
        
        logger.info("Homework statistics for student {}: {} completed out of {} total assignments", 
                studentId, completedHomeworkCount, totalHomeworkCount);
        
        Map<String, List<ExerciseAttempt>> attemptsBySubject = attempts.stream()
                .filter(attempt -> attempt.getExercise() != null 
                        && attempt.getExercise().getExerciseType() != null)
                .collect(Collectors.groupingBy(
                        attempt -> attempt.getExercise().getExerciseType().getName()
                ));
        
        List<WeeklyReportData.SubjectProgress> subjectProgressList = attemptsBySubject.entrySet().stream()
                .map(entry -> {
                    String subjectName = entry.getKey();
                    List<ExerciseAttempt> subjectAttempts = entry.getValue();
                    
                    long subjectTotalProblems = subjectAttempts.stream()
                            .mapToLong(attempt -> attempt.getTotalAttempts() != null ? attempt.getTotalAttempts() : 0L)
                            .sum();
                    
                    long subjectTotalCorrect = subjectAttempts.stream()
                            .mapToLong(attempt -> attempt.getTotalCorrect() != null ? attempt.getTotalCorrect() : 0L)
                            .sum();
                    
                    int subjectAccuracyRate = subjectTotalProblems > 0 
                            ? (int) Math.round((double) subjectTotalCorrect * 100.0 / subjectTotalProblems)
                            : 0;
                    
                    long practiceTime = subjectAttempts.stream()
                            .mapToLong(attempt -> {
                                if (attempt.getStartedAt() != null && attempt.getCompletedAt() != null) {
                                    return java.time.Duration.between(
                                            attempt.getStartedAt(), 
                                            attempt.getCompletedAt()
                                    ).getSeconds();
                                }
                                return 0L;
                            })
                            .sum();
                    
                    return WeeklyReportData.SubjectProgress.builder()
                            .subjectName(subjectName)
                            .problemsSolved(subjectTotalProblems)
                            .accuracyRate(subjectAccuracyRate)
                            .practiceTimeSeconds(practiceTime)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getProblemsSolved(), a.getProblemsSolved()))
                .collect(Collectors.toList());
        
        return WeeklyReportData.builder()
                .studentFirstName(student.getUser().getFirstName())
                .studentLastName(student.getUser().getLastName())
                .weekStartDate(weekStartDate)
                .weekEndDate(weekEndDate)
                .problemsSolved(totalProblemsSolved)
                .accuracyRate(accuracyRate)
                .practiceTimeSeconds(totalPracticeTimeSeconds)
                .currentStreak(currentStreak)
                .completedHomeworkCount(completedHomeworkCount)
                .totalHomeworkCount(totalHomeworkCount)
                .subjectProgress(subjectProgressList)
                .build();
    }
    
    @Override
    @Transactional
    public void sendWeeklyReportsToAllGuardians() {
        logger.info("Starting weekly reports sending to all guardians");
        
        LocalDate today = LocalDate.now();
        LocalDate weekStartDate = today;
        while (weekStartDate.getDayOfWeek().getValue() != 1) { 
            weekStartDate = weekStartDate.minusDays(1);
        }
        LocalDate weekEndDate = today; 
        
        logger.info("Generating reports for week: {} to {}", weekStartDate, weekEndDate);
        
        List<Student> allStudents = studentRepository.findAll();
        logger.info("Found {} students in total", allStudents.size());
        
        if (allStudents.isEmpty()) {
            logger.warn("No students found in database");
            return;
        }
        
        int successCount = 0;
        int errorCount = 0;
        int skippedCount = 0;
        
        for (Student student : allStudents) {
            try {
                logger.debug("Processing student: {} {}",
                        student.getUser().getFirstName(), student.getUser().getLastName());
                
                if (student.getGuardian() == null) {
                    logger.warn("Student {} {} does not have a guardian, skipping",
                            student.getUser().getFirstName(), student.getUser().getLastName());
                    skippedCount++;
                    continue;
                }
                
                if (student.getGuardian().getEmail() == null || student.getGuardian().getEmail().trim().isEmpty()) {
                    logger.warn("Student {} {} guardian does not have email, skipping",
                            student.getUser().getFirstName(), student.getUser().getLastName());
                    skippedCount++;
                    continue;
                }
                
                logger.info("Generating report for student: {} {}",
                        student.getUser().getFirstName(), student.getUser().getLastName());
                WeeklyReportData reportData = generateWeeklyReport(
                        student.getId(), 
                        weekStartDate, 
                        weekEndDate
                );
                
                String guardianEmail = student.getGuardian().getEmail();
                String guardianFirstName = student.getGuardian().getFirstName();
                
                logger.info("Sending email to guardian: {} for student: {} {}",
                        guardianEmail, student.getUser().getFirstName(), student.getUser().getLastName());
                
                emailService.sendWeeklyReport(guardianEmail, guardianFirstName, reportData);
                successCount++;
                
                logger.info("Weekly report sent successfully to {} for student {} {}",
                        guardianEmail, student.getUser().getFirstName(), student.getUser().getLastName());
                
            } catch (Exception e) {
                errorCount++;
                logger.error("Error sending weekly report for student {} {}: {}",
                        student.getUser().getFirstName(), student.getUser().getLastName(), e.getMessage(), e);
            }
        }
        
        logger.info("Weekly reports sending completed. Success: {}, Errors: {}, Skipped: {}",
                successCount, errorCount, skippedCount);
    }
}