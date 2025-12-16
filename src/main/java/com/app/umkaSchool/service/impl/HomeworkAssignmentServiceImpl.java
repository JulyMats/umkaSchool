package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.homeworkassignment.CreateHomeworkAssignmentRequest;
import com.app.umkaSchool.dto.homeworkassignment.HomeworkAssignmentResponse;
import com.app.umkaSchool.dto.homeworkassignment.UpdateHomeworkAssignmentRequest;
import com.app.umkaSchool.exception.ResourceNotFoundException;
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
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
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
    private final HomeworkAssignmentStudentRepository homeworkAssignmentStudentRepository;

    @Autowired
    public HomeworkAssignmentServiceImpl(HomeworkAssignmentRepository homeworkAssignmentRepository,
                                         HomeworkRepository homeworkRepository,
                                         TeacherRepository teacherRepository,
                                         StudentRepository studentRepository,
                                         StudentGroupRepository studentGroupRepository,
                                         ExerciseAttemptRepository exerciseAttemptRepository,
                                         HomeworkAssignmentStudentRepository homeworkAssignmentStudentRepository) {
        this.homeworkAssignmentRepository = homeworkAssignmentRepository;
        this.homeworkRepository = homeworkRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.studentGroupRepository = studentGroupRepository;
        this.exerciseAttemptRepository = exerciseAttemptRepository;
        this.homeworkAssignmentStudentRepository = homeworkAssignmentStudentRepository;
    }

    @Override
    @Transactional
    public HomeworkAssignmentResponse createHomeworkAssignment(CreateHomeworkAssignmentRequest request) {
        logger.info("Creating new homework assignment for homework: {}", request.getHomeworkId());

        Homework homework = homeworkRepository.findById(request.getHomeworkId())
                .orElseThrow(() -> new ResourceNotFoundException("Homework not found"));

        HomeworkAssignment assignment = new HomeworkAssignment();
        assignment.setHomework(homework);
        assignment.setDueDate(request.getDueDate());
        assignment.setStatus(HomeworkStatus.PENDING);

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
            assignment.setTeacher(teacher);
        }

        assignment.setAssignedGroups(new HashSet<>());
        assignment.setAssignedStudents(new HashSet<>());

        assignment = homeworkAssignmentRepository.save(assignment);

        // Add groups if provided
        if (request.getGroupIds() != null && !request.getGroupIds().isEmpty()) {
            for (UUID groupId : request.getGroupIds()) {
                StudentGroup group = studentGroupRepository.findById(groupId)
                        .orElseThrow(() -> new ResourceNotFoundException("Student group not found: " + groupId));

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
                        .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + studentId));

                HomeworkAssignmentStudent assignmentStudent = new HomeworkAssignmentStudent();
                assignmentStudent.getId().setHomeworkAssignmentId(assignment.getId());
                assignmentStudent.getId().setStudentId(studentId);
                assignmentStudent.setHomeworkAssignment(assignment);
                assignmentStudent.setStudent(student);
                assignmentStudent.setStatus(HomeworkStatus.PENDING);

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
                .orElseThrow(() -> new ResourceNotFoundException("Homework assignment not found"));
        
        HomeworkStatus oldStatus = assignment.getStatus();

        if (request.getDueDate() != null) {
            assignment.setDueDate(request.getDueDate());
            
            if (oldStatus == HomeworkStatus.OVERDUE) {
                assignment.setStatus(HomeworkStatus.PENDING);
                
                int updatedCount = 0;
                
                for (HomeworkAssignmentStudent assignmentStudent : assignment.getAssignedStudents()) {
                    if (assignmentStudent.getStatus() == HomeworkStatus.OVERDUE) {
                        assignmentStudent.setStatus(HomeworkStatus.PENDING);
                        updatedCount++;
                    }
                }
                
                for (HomeworkAssignmentStudentGroup ag : assignment.getAssignedGroups()) {
                    UUID groupId = ag.getStudentGroup().getId();
                    List<Student> groupStudents = studentRepository.findByGroup_Id(groupId);
                    for (Student s : groupStudents) {
                        HomeworkAssignmentStudent assignmentStudent = homeworkAssignmentStudentRepository
                                .findById_HomeworkAssignmentIdAndId_StudentId(assignment.getId(), s.getId())
                                .orElse(null);
                        
                        if (assignmentStudent != null && assignmentStudent.getStatus() == HomeworkStatus.OVERDUE) {
                            assignmentStudent.setStatus(HomeworkStatus.PENDING);
                            homeworkAssignmentStudentRepository.save(assignmentStudent);
                            updatedCount++;
                        }
                    }
                }
                
                if (updatedCount > 0) {
                    logger.info("Updated {} student assignment statuses from OVERDUE to PENDING after due date change", updatedCount);
                }
            }
        }

        if (request.getGroupIds() != null) {
            Set<UUID> oldGroupIds = assignment.getAssignedGroups().stream()
                    .map(ag -> ag.getStudentGroup().getId())
                    .collect(Collectors.toSet());
            Set<UUID> newGroupIds = new HashSet<>(request.getGroupIds());
            
            Set<UUID> groupsToRemove = new HashSet<>(oldGroupIds);
            groupsToRemove.removeAll(newGroupIds);
            for (UUID groupId : groupsToRemove) {
                removeGroupFromAssignment(assignmentId, groupId);
            }
            
            Set<UUID> groupsToAdd = new HashSet<>(newGroupIds);
            groupsToAdd.removeAll(oldGroupIds);
            if (!groupsToAdd.isEmpty()) {
                addGroupsToAssignment(assignmentId, new ArrayList<>(groupsToAdd));
            }
        }

        if (request.getStudentIds() != null) {
            Set<UUID> oldStudentIds = assignment.getAssignedStudents().stream()
                    .map(as -> as.getStudent().getId())
                    .collect(Collectors.toSet());
            Set<UUID> newStudentIds = new HashSet<>(request.getStudentIds());
            
            Set<UUID> studentsToRemove = new HashSet<>(oldStudentIds);
            studentsToRemove.removeAll(newStudentIds);
            for (UUID studentId : studentsToRemove) {
                removeStudentFromAssignment(assignmentId, studentId);
            }
            
            Set<UUID> studentsToAdd = new HashSet<>(newStudentIds);
            studentsToAdd.removeAll(oldStudentIds);
            if (!studentsToAdd.isEmpty()) {
                addStudentsToAssignment(assignmentId, new ArrayList<>(studentsToAdd));
            }
        }

        assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework assignment not found"));

        logger.info("Homework assignment updated successfully: {}", assignmentId);

        return mapToResponse(assignment);
    }

    @Override
    public HomeworkAssignmentResponse getHomeworkAssignmentById(UUID assignmentId) {
        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework assignment not found"));
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
                .map(assignment -> mapToResponseForStudent(assignment, studentId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteHomeworkAssignment(UUID assignmentId) {
        logger.info("Deleting homework assignment: {}", assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework assignment not found"));

        homeworkAssignmentRepository.delete(assignment);
        logger.info("Homework assignment deleted successfully: {}", assignmentId);
    }

    @Override
    @Transactional
    public void addStudentsToAssignment(UUID assignmentId, List<UUID> studentIds) {
        logger.info("Adding {} students to assignment: {}", studentIds.size(), assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework assignment not found"));

        for (UUID studentId : studentIds) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));

            HomeworkAssignmentStudent assignmentStudent = new HomeworkAssignmentStudent();
            assignmentStudent.getId().setHomeworkAssignmentId(assignment.getId());
            assignmentStudent.getId().setStudentId(studentId);
            assignmentStudent.setHomeworkAssignment(assignment);
            assignmentStudent.setStudent(student);
            assignmentStudent.setStatus(HomeworkStatus.PENDING); 

            assignment.getAssignedStudents().add(assignmentStudent);
        }

        homeworkAssignmentRepository.save(assignment);

        updateGlobalAssignmentStatus(assignment);
        
        logger.info("Students added to assignment successfully");
    }

    @Override
    @Transactional
    public void addGroupsToAssignment(UUID assignmentId, List<UUID> groupIds) {
        logger.info("Adding {} groups to assignment: {}", groupIds.size(), assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework assignment not found"));

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
        
        updateGlobalAssignmentStatus(assignment);

        logger.info("Groups added to assignment successfully");
    }

    @Override
    @Transactional
    public void removeStudentFromAssignment(UUID assignmentId, UUID studentId) {
        logger.info("Removing student {} from assignment: {}", studentId, assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework assignment not found"));

        assignment.getAssignedStudents().removeIf(as -> as.getId().getStudentId().equals(studentId));
        homeworkAssignmentRepository.save(assignment);

        updateGlobalAssignmentStatus(assignment);

        logger.info("Student removed from assignment successfully");
    }

    @Override
    @Transactional
    public void removeGroupFromAssignment(UUID assignmentId, UUID groupId) {
        logger.info("Removing group {} from assignment: {}", groupId, assignmentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Homework assignment not found"));

        assignment.getAssignedGroups().removeIf(ag -> ag.getId().getStudentGroupId().equals(groupId));
        homeworkAssignmentRepository.save(assignment);

        updateGlobalAssignmentStatus(assignment);

        logger.info("Group removed from assignment successfully");
    }

    @Override
    @Transactional
    public void updateOverdueAssignments() {
        logger.info("Updating overdue assignments");

        ZonedDateTime now = ZonedDateTime.now();
        
        List<HomeworkAssignment> assignmentsDueToday = homeworkAssignmentRepository
                .findByDueDateOnDate(now);

        int updatedStudentCount = 0;
        int updatedAssignmentCount = 0;
        
        for (HomeworkAssignment assignment : assignmentsDueToday) {
            boolean assignmentUpdated = false;
            
            for (HomeworkAssignmentStudent assignmentStudent : assignment.getAssignedStudents()) {
                if (assignmentStudent.getStatus() == HomeworkStatus.PENDING) {
                    assignmentStudent.setStatus(HomeworkStatus.OVERDUE);
                    updatedStudentCount++;
                }
            }

            if (assignment.getStatus() != HomeworkStatus.COMPLETED) {
                assignment.setStatus(HomeworkStatus.OVERDUE);
                assignmentUpdated = true;
                updatedAssignmentCount++;
            }
            
            if (assignmentUpdated || updatedStudentCount > 0) {
                homeworkAssignmentRepository.save(assignment);
            }
        }
        
        logger.info("Updated {} overdue student assignments and {} global assignments (out of {} checked)", 
                updatedStudentCount, updatedAssignmentCount, assignmentsDueToday.size());
    }

    @Override
    @Transactional
    public void checkAndUpdateAssignmentStatus(UUID homeworkAssignmentId, UUID studentId) {
        logger.info("Checking assignment status for assignment: {}, student: {}", homeworkAssignmentId, studentId);

        HomeworkAssignment assignment = homeworkAssignmentRepository.findById(homeworkAssignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Homework assignment not found"));

       Homework homework = assignment.getHomework();
        Set<HomeworkExercise> homeworkExercises = homework.getExercises();

        if (homeworkExercises.isEmpty()) {
            logger.warn("Homework has no exercises, cannot check completion");
            return;
        }

        Long completedCount = exerciseAttemptRepository.countCompletedExercises(homeworkAssignmentId, studentId);
        int totalExercises = homeworkExercises.size();

        logger.info("Student {} has completed {}/{} exercises in assignment {}",
            studentId, completedCount, totalExercises, homeworkAssignmentId);

        HomeworkAssignmentStudent assignmentStudent = homeworkAssignmentStudentRepository
                .findById_HomeworkAssignmentIdAndId_StudentId(homeworkAssignmentId, studentId)
                .orElse(null);

        
        if (assignmentStudent == null) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
            
            assignmentStudent = new HomeworkAssignmentStudent();
            assignmentStudent.getId().setHomeworkAssignmentId(homeworkAssignmentId);
            assignmentStudent.getId().setStudentId(studentId);
            assignmentStudent.setHomeworkAssignment(assignment);
            assignmentStudent.setStudent(student);
            assignmentStudent.setStatus(HomeworkStatus.PENDING); 
            
            assignmentStudent = homeworkAssignmentStudentRepository.save(assignmentStudent);
            logger.info("Created individual assignment record for student {} (assigned via group)", studentId);
        }

        if (completedCount >= totalExercises && assignmentStudent.getStatus() != HomeworkStatus.COMPLETED) {
            assignmentStudent.setStatus(HomeworkStatus.COMPLETED);
            homeworkAssignmentStudentRepository.save(assignmentStudent);
            logger.info("Assignment {} marked as COMPLETED for student {}", homeworkAssignmentId, studentId);

            updateGlobalAssignmentStatus(assignment);
        }
    }



    
    private void updateGlobalAssignmentStatus(HomeworkAssignment assignment) {
        Set<UUID> allStudentIds = new HashSet<>();

        assignment.getAssignedStudents().forEach(as ->
                allStudentIds.add(as.getStudent().getId())
        );

        assignment.getAssignedGroups().forEach(ag -> {
            UUID groupId = ag.getStudentGroup().getId();
            List<Student> groupStudents = studentRepository.findByGroup_Id(groupId);
            groupStudents.forEach(s -> allStudentIds.add(s.getId()));
        });

        if (allStudentIds.isEmpty()) {
            return;
        }

        for (UUID studentId : allStudentIds) {
            HomeworkAssignmentStudent assignmentStudent = homeworkAssignmentStudentRepository
                    .findById_HomeworkAssignmentIdAndId_StudentId(assignment.getId(), studentId)
                    .orElse(null);

            if (assignmentStudent == null || assignmentStudent.getStatus() != HomeworkStatus.COMPLETED) {
                assignment.setStatus(HomeworkStatus.PENDING);
                return;
            }
        }

        if (assignment.getStatus() != HomeworkStatus.COMPLETED) {
            assignment.setStatus(HomeworkStatus.COMPLETED);
            homeworkAssignmentRepository.save(assignment);
            logger.info("All students completed assignment {}. Marking main assignment as COMPLETED.", assignment.getId());
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

    private HomeworkAssignmentResponse mapToResponseForStudent(HomeworkAssignment assignment, UUID studentId) {
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

        HomeworkStatus studentStatus = HomeworkStatus.PENDING;
        HomeworkAssignmentStudent assignmentStudent = homeworkAssignmentStudentRepository
                .findById_HomeworkAssignmentIdAndId_StudentId(assignment.getId(), studentId)
                .orElse(null);
        
        if (assignmentStudent != null) {
            studentStatus = assignmentStudent.getStatus();
        }

        return HomeworkAssignmentResponse.builder()
                .id(assignment.getId())
                .homeworkId(assignment.getHomework().getId())
                .homeworkTitle(assignment.getHomework().getTitle())
                .teacherId(teacherId)
                .teacherName(teacherName)
                .assignedAt(assignment.getAssignedAt())
                .dueDate(assignment.getDueDate())
                .status(studentStatus)
                .assignedGroupIds(groupIds)
                .assignedStudentIds(studentIds)
                .build();
    }
}
