package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.homeworkassignment.CreateHomeworkAssignmentRequest;
import com.app.umkaSchool.dto.homeworkassignment.HomeworkAssignmentResponse;
import com.app.umkaSchool.dto.homeworkassignment.UpdateHomeworkAssignmentRequest;
import com.app.umkaSchool.model.*;
import com.app.umkaSchool.model.enums.HomeworkStatus;
import com.app.umkaSchool.repository.*;
import com.app.umkaSchool.service.HomeworkAssignmentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class HomeworkAssignmentServiceImpl implements HomeworkAssignmentService {
    private static final Logger logger = LoggerFactory.getLogger(HomeworkAssignmentServiceImpl.class);

    private final HomeworkAssignmentRepository homeworkAssignmentRepository;
    private final HomeworkRepository homeworkRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final StudentGroupRepository studentGroupRepository;
    private final ExerciseAttemptRepository exerciseAttemptRepository;

    @Autowired
    public HomeworkAssignmentServiceImpl(HomeworkAssignmentRepository homeworkAssignmentRepository,
                                         HomeworkRepository homeworkRepository,
                                         TeacherRepository teacherRepository,
                                         StudentRepository studentRepository,
                                         StudentGroupRepository studentGroupRepository,
                                         ExerciseAttemptRepository exerciseAttemptRepository) {
        this.homeworkAssignmentRepository = homeworkAssignmentRepository;
        this.homeworkRepository = homeworkRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.exerciseAttemptRepository = exerciseAttemptRepository;
    }

    @Override
    @Transactional
    public HomeworkAssignmentResponse createHomeworkAssignment(CreateHomeworkAssignmentRequest request) {
        logger.info("Creating new homework assignment for homework: {}", request.getHomeworkId());

        Homework homework = homeworkRepository.findById(request.getHomeworkId())
                .orElseThrow(() -> new IllegalArgumentException("Homework not found"));

        HomeworkAssignment assignment = new HomeworkAssignment();
        assignment.setHomework(homework);
        assignment.setDueDate(request.getDueDate());
        assignment.setStatus(HomeworkStatus.PENDING);

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            assignment.setTeacher(teacher);
        }

        assignment.setAssignedGroups(new HashSet<>());
        assignment.setAssignedStudents(new HashSet<>());

        assignment = homeworkAssignmentRepository.save(assignment);

        // Add groups if provided
        if (request.getGroupIds() != null && !request.getGroupIds().isEmpty()) {
            for (UUID groupId : request.getGroupIds()) {
                StudentGroup group = studentGroupRepository.findById(groupId)
                        .orElseThrow(() -> new IllegalArgumentException("Student group not found: " + groupId));

                HomeworkAssignmentStudentGroup assignmentGroup = new HomeworkAssignmentStudentGroup();
                assignmentGroup.getId().setHomeworkAssignmentId(assignment.getId());
                assignmentGroup.getId().setStudentGroupId(groupId);
                assignmentGroup.setHomeworkAssignment(assignment);
                assignmentGroup.setStudentGroup(group);

                assignment.getAssignedGroups().add(assignmentGroup);
            }
        }

        // Add students if provided
        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            for (UUID studentId : request.getStudentIds()) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

                HomeworkAssignmentStudent assignmentStudent = new HomeworkAssignmentStudent();
                assignmentStudent.getId().setHomeworkAssignmentId(assignment.getId());
                assignmentStudent.getId().setStudentId(studentId);
                assignmentStudent.setHomeworkAssignment(assignment);
                assignmentStudent.setStudent(student);

                assignment.getAssignedStudents().add(assignmentStudent);
            }
        }

        assignment = homeworkAssignmentRepository.save(assignment);
        logger.info("Homework assignment created successfully: {}", assignment.getId());

        return mapToResponse(assignment);
    }

    @Override
    @Transactional
    public HomeworkAssignmentResponse updateHomeworkAssignment(UUID assignmentId, UpdateHomeworkAssignmentRequest request) {
        logger.info("Updating homework assignment: {}", assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));

        if (request.getDueDate() != null) {
            assignment.setDueDate(request.getDueDate());
        }

        if (request.getStatus() != null) {
            assignment.setStatus(request.getStatus());
        }

        // Update groups if provided
        if (request.getGroupIds() != null) {
            assignment.getAssignedGroups().clear();
            for (UUID groupId : request.getGroupIds()) {
                StudentGroup group = studentGroupRepository.findById(groupId)
                        .orElseThrow(() -> new IllegalArgumentException("Student group not found: " + groupId));

                HomeworkAssignmentStudentGroup assignmentGroup = new HomeworkAssignmentStudentGroup();
                assignmentGroup.getId().setHomeworkAssignmentId(assignment.getId());
                assignmentGroup.getId().setStudentGroupId(groupId);
                assignmentGroup.setHomeworkAssignment(assignment);
                assignmentGroup.setStudentGroup(group);

                assignment.getAssignedGroups().add(assignmentGroup);
            }
        }

        // Update students if provided
        if (request.getStudentIds() != null) {
            assignment.getAssignedStudents().clear();
            for (UUID studentId : request.getStudentIds()) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

                HomeworkAssignmentStudent assignmentStudent = new HomeworkAssignmentStudent();
                assignmentStudent.getId().setHomeworkAssignmentId(assignment.getId());
                assignmentStudent.getId().setStudentId(studentId);
                assignmentStudent.setHomeworkAssignment(assignment);
                assignmentStudent.setStudent(student);

                assignment.getAssignedStudents().add(assignmentStudent);
            }
        }

        assignment = homeworkAssignmentRepository.save(assignment);
        logger.info("Homework assignment updated successfully: {}", assignmentId);

        return mapToResponse(assignment);
    }

    @Override
    public HomeworkAssignmentResponse getHomeworkAssignmentById(UUID assignmentId) {
        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));
        return mapToResponse(assignment);
    }

    @Override
    public List<HomeworkAssignmentResponse> getAllHomeworkAssignments() {
        return homeworkAssignmentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HomeworkAssignmentResponse> getHomeworkAssignmentsByHomework(UUID homeworkId) {
        return homeworkAssignmentRepository.findByHomework_Id(homeworkId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HomeworkAssignmentResponse> getHomeworkAssignmentsByTeacher(UUID teacherId) {
        return homeworkAssignmentRepository.findByTeacher_Id(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HomeworkAssignmentResponse> getHomeworkAssignmentsByStatus(HomeworkStatus status) {
        return homeworkAssignmentRepository.findByStatusOrderByDueDateAsc(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HomeworkAssignmentResponse> getHomeworkAssignmentsByGroup(UUID groupId) {
        return homeworkAssignmentRepository.findByAssignedGroups_StudentGroup_Id(groupId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<HomeworkAssignmentResponse> getHomeworkAssignmentsByStudent(UUID studentId) {
        return homeworkAssignmentRepository.findAllByStudentIdIncludingGroup(studentId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteHomeworkAssignment(UUID assignmentId) {
        logger.info("Deleting homework assignment: {}", assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));

        homeworkAssignmentRepository.delete(assignment);
        logger.info("Homework assignment deleted successfully: {}", assignmentId);
    }

    @Override
    @Transactional
    public void addStudentsToAssignment(UUID assignmentId, List<UUID> studentIds) {
        logger.info("Adding {} students to assignment: {}", studentIds.size(), assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));

        for (UUID studentId : studentIds) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

            HomeworkAssignmentStudent assignmentStudent = new HomeworkAssignmentStudent();
            assignmentStudent.getId().setHomeworkAssignmentId(assignment.getId());
            assignmentStudent.getId().setStudentId(studentId);
            assignmentStudent.setHomeworkAssignment(assignment);
            assignmentStudent.setStudent(student);

            assignment.getAssignedStudents().add(assignmentStudent);
        }

        homeworkAssignmentRepository.save(assignment);
        logger.info("Students added to assignment successfully");
    }

    @Override
    @Transactional
    public void addGroupsToAssignment(UUID assignmentId, List<UUID> groupIds) {
        logger.info("Adding {} groups to assignment: {}", groupIds.size(), assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));

        for (UUID groupId : groupIds) {
            StudentGroup group = studentGroupRepository.findById(groupId)
                    .orElseThrow(() -> new IllegalArgumentException("Student group not found: " + groupId));

            HomeworkAssignmentStudentGroup assignmentGroup = new HomeworkAssignmentStudentGroup();
            assignmentGroup.getId().setHomeworkAssignmentId(assignment.getId());
            assignmentGroup.getId().setStudentGroupId(groupId);
            assignmentGroup.setHomeworkAssignment(assignment);
            assignmentGroup.setStudentGroup(group);

            assignment.getAssignedGroups().add(assignmentGroup);
        }

        homeworkAssignmentRepository.save(assignment);
        logger.info("Groups added to assignment successfully");
    }

    @Override
    @Transactional
    public void removeStudentFromAssignment(UUID assignmentId, UUID studentId) {
        logger.info("Removing student {} from assignment: {}", studentId, assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));

        assignment.getAssignedStudents().removeIf(as -> as.getId().getStudentId().equals(studentId));
        homeworkAssignmentRepository.save(assignment);

        logger.info("Student removed from assignment successfully");
    }

    @Override
    @Transactional
    public void removeGroupFromAssignment(UUID assignmentId, UUID groupId) {
        logger.info("Removing group {} from assignment: {}", groupId, assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));

        assignment.getAssignedGroups().removeIf(ag -> ag.getId().getStudentGroupId().equals(groupId));
        homeworkAssignmentRepository.save(assignment);

        logger.info("Group removed from assignment successfully");
    }

    @Override
    @Transactional
    public void updateOverdueAssignments() {
        logger.info("Updating overdue assignments");

        ZonedDateTime now = ZonedDateTime.now();
        
        // Find assignments that are past due date and still PENDING (not COMPLETED)
        List<HomeworkAssignment> overdueAssignments = homeworkAssignmentRepository
                .findByDueDateBeforeAndStatus(now, HomeworkStatus.PENDING);

        int updatedCount = 0;
        for (HomeworkAssignment assignment : overdueAssignments) {
            // Only update if status is still PENDING (not already COMPLETED)
            if (assignment.getStatus() == HomeworkStatus.PENDING) {
                assignment.setStatus(HomeworkStatus.OVERDUE);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            homeworkAssignmentRepository.saveAll(overdueAssignments);
        }
        
        logger.info("Updated {} overdue assignments (out of {} checked)", updatedCount, overdueAssignments.size());
    }

    @Override
    @Transactional
    public void checkAndUpdateAssignmentStatus(UUID homeworkAssignmentId, UUID studentId) {
        logger.info("Checking assignment status for assignment: {}, student: {}", homeworkAssignmentId, studentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(homeworkAssignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));

        // Get all exercises from the homework
        Homework homework = assignment.getHomework();
        Set<HomeworkExercise> homeworkExercises = homework.getExercises();

        if (homeworkExercises.isEmpty()) {
            logger.warn("Homework has no exercises, cannot check completion");
            return;
        }

        // Count how many exercises the student has completed using JOIN queries
        Long completedCount = exerciseAttemptRepository.countCompletedExercises(homeworkAssignmentId, studentId);
        int totalExercises = homeworkExercises.size();

        logger.info("Student {} has completed {}/{} exercises in assignment {}",
            studentId, completedCount, totalExercises, homeworkAssignmentId);

        // If all exercises are completed and status is not already COMPLETED, update it
        if (completedCount >= totalExercises && assignment.getStatus() != HomeworkStatus.COMPLETED) {
            assignment.setStatus(HomeworkStatus.COMPLETED);
            homeworkAssignmentRepository.save(assignment);
            logger.info("Assignment {} marked as COMPLETED for student {}", homeworkAssignmentId, studentId);
        }
    }

    @Override
    @Transactional
    public void checkAndUpdateAssignmentStatusForExercise(UUID exerciseId, UUID studentId) {
        logger.info("Checking assignment status for exercise: {}, student: {}", exerciseId, studentId);

        // Find all homework assignments that contain this exercise and are assigned to this student
        List<HomeworkAssignment> assignments = homeworkAssignmentRepository.findByExerciseIdAndStudentId(exerciseId, studentId);

        if (assignments.isEmpty()) {
            logger.debug("No homework assignments found for exercise: {}, student: {}", exerciseId, studentId);
            return;
        }

        // Check each assignment
        for (HomeworkAssignment assignment : assignments) {
            try {
                checkAndUpdateAssignmentStatus(assignment.getId(), studentId);
            } catch (Exception e) {
                logger.error("Error checking assignment {} for student {}: {}",
                    assignment.getId(), studentId, e.getMessage());
            }
        }
    }

    private HomeworkAssignmentResponse mapToResponse(HomeworkAssignment assignment) {
        List<UUID> groupIds = assignment.getAssignedGroups().stream()
                .map(ag -> ag.getStudentGroup().getId())
                .collect(Collectors.toList());

        List<UUID> studentIds = assignment.getAssignedStudents().stream()
                .map(as -> as.getStudent().getId())
                .collect(Collectors.toList());

        String teacherName = null;
        UUID teacherId = null;
        if (assignment.getTeacher() != null) {
            teacherId = assignment.getTeacher().getId();
            teacherName = assignment.getTeacher().getUser().getFirstName() + " " +
                    assignment.getTeacher().getUser().getLastName();
        }

        return HomeworkAssignmentResponse.builder()
                .id(assignment.getId())
                .homeworkId(assignment.getHomework().getId())
                .homeworkTitle(assignment.getHomework().getTitle())
                .teacherId(teacherId)
                .teacherName(teacherName)
                .assignedAt(assignment.getAssignedAt())
                .dueDate(assignment.getDueDate())
                .status(assignment.getStatus())
                .assignedGroupIds(groupIds)
                .assignedStudentIds(studentIds)
                .build();
    }
}
