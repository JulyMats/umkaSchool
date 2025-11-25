package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.dto.student.StudentResponse;
import com.app.umkaSchool.dto.student.UpdateStudentRequest;
import com.app.umkaSchool.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    @Autowired
    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        StudentResponse response = studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{studentId}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable UUID studentId,
            @Valid @RequestBody UpdateStudentRequest request) {
        StudentResponse response = studentService.updateStudent(studentId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{studentId}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable UUID studentId) {
        StudentResponse response = studentService.getStudentById(studentId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<StudentResponse> getStudentByUserId(@PathVariable UUID userId) {
        StudentResponse response = studentService.getStudentByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents() {
        List<StudentResponse> students = studentService.getAllStudents();
        return ResponseEntity.ok(students);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<StudentResponse>> getStudentsByTeacher(@PathVariable UUID teacherId) {
        List<StudentResponse> students = studentService.getStudentsByTeacher(teacherId);
        return ResponseEntity.ok(students);
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<StudentResponse>> getStudentsByGroup(@PathVariable UUID groupId) {
        List<StudentResponse> students = studentService.getStudentsByGroup(groupId);
        return ResponseEntity.ok(students);
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID studentId) {
        studentService.deleteStudent(studentId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{studentId}/teacher/{teacherId}")
    public ResponseEntity<Void> assignToTeacher(
            @PathVariable UUID studentId,
            @PathVariable UUID teacherId) {
        studentService.assignToTeacher(studentId, teacherId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{studentId}/group/{groupId}")
    public ResponseEntity<Void> assignToGroup(
            @PathVariable UUID studentId,
            @PathVariable UUID groupId) {
        studentService.assignToGroup(studentId, groupId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{studentId}/activity")
    public ResponseEntity<Void> updateLastActivity(@PathVariable UUID studentId) {
        studentService.updateLastActivity(studentId);
        return ResponseEntity.ok().build();
    }
}