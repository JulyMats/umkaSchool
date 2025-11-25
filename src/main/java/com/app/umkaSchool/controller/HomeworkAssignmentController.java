package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.homeworkassignment.CreateHomeworkAssignmentRequest;
import com.app.umkaSchool.dto.homeworkassignment.HomeworkAssignmentResponse;
import com.app.umkaSchool.dto.homeworkassignment.UpdateHomeworkAssignmentRequest;
import com.app.umkaSchool.model.enums.HomeworkStatus;
import com.app.umkaSchool.service.HomeworkAssignmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/homework-assignments")
public class HomeworkAssignmentController {

    private final HomeworkAssignmentService homeworkAssignmentService;

    @Autowired
    public HomeworkAssignmentController(HomeworkAssignmentService homeworkAssignmentService) {
        this.homeworkAssignmentService = homeworkAssignmentService;
    }

    @PostMapping
    public ResponseEntity<HomeworkAssignmentResponse> createHomeworkAssignment(
            @Valid @RequestBody CreateHomeworkAssignmentRequest request) {
        HomeworkAssignmentResponse response = homeworkAssignmentService.createHomeworkAssignment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{assignmentId}")
    public ResponseEntity<HomeworkAssignmentResponse> updateHomeworkAssignment(
            @PathVariable UUID assignmentId,
            @Valid @RequestBody UpdateHomeworkAssignmentRequest request) {
        HomeworkAssignmentResponse response = homeworkAssignmentService.updateHomeworkAssignment(assignmentId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{assignmentId}")
    public ResponseEntity<HomeworkAssignmentResponse> getHomeworkAssignmentById(@PathVariable UUID assignmentId) {
        // Update overdue assignments before returning
        homeworkAssignmentService.updateOverdueAssignments();
        HomeworkAssignmentResponse response = homeworkAssignmentService.getHomeworkAssignmentById(assignmentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<HomeworkAssignmentResponse>> getAllHomeworkAssignments() {
        // Update overdue assignments before returning
        homeworkAssignmentService.updateOverdueAssignments();
        List<HomeworkAssignmentResponse> assignments = homeworkAssignmentService.getAllHomeworkAssignments();
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/homework/{homeworkId}")
    public ResponseEntity<List<HomeworkAssignmentResponse>> getHomeworkAssignmentsByHomework(
            @PathVariable UUID homeworkId) {
        // Update overdue assignments before returning
        homeworkAssignmentService.updateOverdueAssignments();
        List<HomeworkAssignmentResponse> assignments = homeworkAssignmentService.getHomeworkAssignmentsByHomework(homeworkId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<HomeworkAssignmentResponse>> getHomeworkAssignmentsByTeacher(
            @PathVariable UUID teacherId) {
        // Update overdue assignments before returning
        homeworkAssignmentService.updateOverdueAssignments();
        List<HomeworkAssignmentResponse> assignments = homeworkAssignmentService.getHomeworkAssignmentsByTeacher(teacherId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<HomeworkAssignmentResponse>> getHomeworkAssignmentsByStatus(
            @PathVariable HomeworkStatus status) {
        // Update overdue assignments before returning
        homeworkAssignmentService.updateOverdueAssignments();
        List<HomeworkAssignmentResponse> assignments = homeworkAssignmentService.getHomeworkAssignmentsByStatus(status);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<HomeworkAssignmentResponse>> getHomeworkAssignmentsByGroup(
            @PathVariable UUID groupId) {
        // Update overdue assignments before returning
        homeworkAssignmentService.updateOverdueAssignments();
        List<HomeworkAssignmentResponse> assignments = homeworkAssignmentService.getHomeworkAssignmentsByGroup(groupId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<HomeworkAssignmentResponse>> getHomeworkAssignmentsByStudent(
            @PathVariable UUID studentId) {
        // Update overdue assignments before returning
        homeworkAssignmentService.updateOverdueAssignments();
        List<HomeworkAssignmentResponse> assignments = homeworkAssignmentService.getHomeworkAssignmentsByStudent(studentId);
        return ResponseEntity.ok(assignments);
    }

    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> deleteHomeworkAssignment(@PathVariable UUID assignmentId) {
        homeworkAssignmentService.deleteHomeworkAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{assignmentId}/students")
    public ResponseEntity<Void> addStudentsToAssignment(
            @PathVariable UUID assignmentId,
            @RequestBody List<UUID> studentIds) {
        homeworkAssignmentService.addStudentsToAssignment(assignmentId, studentIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{assignmentId}/groups")
    public ResponseEntity<Void> addGroupsToAssignment(
            @PathVariable UUID assignmentId,
            @RequestBody List<UUID> groupIds) {
        homeworkAssignmentService.addGroupsToAssignment(assignmentId, groupIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{assignmentId}/students/{studentId}")
    public ResponseEntity<Void> removeStudentFromAssignment(
            @PathVariable UUID assignmentId,
            @PathVariable UUID studentId) {
        homeworkAssignmentService.removeStudentFromAssignment(assignmentId, studentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{assignmentId}/groups/{groupId}")
    public ResponseEntity<Void> removeGroupFromAssignment(
            @PathVariable UUID assignmentId,
            @PathVariable UUID groupId) {
        homeworkAssignmentService.removeGroupFromAssignment(assignmentId, groupId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/update-overdue")
    public ResponseEntity<Void> updateOverdueAssignments() {
        homeworkAssignmentService.updateOverdueAssignments();
        return ResponseEntity.ok().build();
    }
}
