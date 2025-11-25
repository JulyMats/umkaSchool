package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.dto.teacher.TeacherResponse;
import com.app.umkaSchool.dto.teacher.UpdateTeacherRequest;
import com.app.umkaSchool.service.TeacherService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;

    @Autowired
    public TeacherController(TeacherService teacherService) {
        this.teacherService = teacherService;
    }

    @PostMapping
    public ResponseEntity<TeacherResponse> createTeacher(@Valid @RequestBody CreateTeacherRequest request) {
        TeacherResponse response = teacherService.createTeacher(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{teacherId}")
    public ResponseEntity<TeacherResponse> updateTeacher(
            @PathVariable UUID teacherId,
            @Valid @RequestBody UpdateTeacherRequest request) {
        TeacherResponse response = teacherService.updateTeacher(teacherId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{teacherId}")
    public ResponseEntity<TeacherResponse> getTeacherById(@PathVariable UUID teacherId) {
        TeacherResponse response = teacherService.getTeacherById(teacherId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<TeacherResponse> getTeacherByUserId(@PathVariable UUID userId) {
        TeacherResponse response = teacherService.getTeacherByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TeacherResponse>> getAllTeachers() {
        List<TeacherResponse> teachers = teacherService.getAllTeachers();
        return ResponseEntity.ok(teachers);
    }

    @DeleteMapping("/{teacherId}")
    public ResponseEntity<Void> deleteTeacher(@PathVariable UUID teacherId) {
        teacherService.deleteTeacher(teacherId);
        return ResponseEntity.noContent().build();
    }
}

