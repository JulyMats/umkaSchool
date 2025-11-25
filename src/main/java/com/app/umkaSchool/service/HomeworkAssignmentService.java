package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.homeworkassignment.CreateHomeworkAssignmentRequest;
import com.app.umkaSchool.dto.homeworkassignment.HomeworkAssignmentResponse;
import com.app.umkaSchool.dto.homeworkassignment.UpdateHomeworkAssignmentRequest;
import com.app.umkaSchool.model.enums.HomeworkStatus;

import java.util.List;
import java.util.UUID;

public interface HomeworkAssignmentService {

    HomeworkAssignmentResponse createHomeworkAssignment(CreateHomeworkAssignmentRequest request);

    HomeworkAssignmentResponse updateHomeworkAssignment(UUID assignmentId, UpdateHomeworkAssignmentRequest request);

    HomeworkAssignmentResponse getHomeworkAssignmentById(UUID assignmentId);

    List<HomeworkAssignmentResponse> getAllHomeworkAssignments();

    List<HomeworkAssignmentResponse> getHomeworkAssignmentsByHomework(UUID homeworkId);

    List<HomeworkAssignmentResponse> getHomeworkAssignmentsByTeacher(UUID teacherId);

    List<HomeworkAssignmentResponse> getHomeworkAssignmentsByStatus(HomeworkStatus status);

    List<HomeworkAssignmentResponse> getHomeworkAssignmentsByGroup(UUID groupId);

    List<HomeworkAssignmentResponse> getHomeworkAssignmentsByStudent(UUID studentId);

    void deleteHomeworkAssignment(UUID assignmentId);

    void addStudentsToAssignment(UUID assignmentId, List<UUID> studentIds);

    void addGroupsToAssignment(UUID assignmentId, List<UUID> groupIds);

    void removeStudentFromAssignment(UUID assignmentId, UUID studentId);

    void removeGroupFromAssignment(UUID assignmentId, UUID groupId);

    void updateOverdueAssignments();

    void checkAndUpdateAssignmentStatus(UUID homeworkAssignmentId, UUID studentId);

    void checkAndUpdateAssignmentStatusForExercise(UUID exerciseId, UUID studentId);
}

