package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.TeacherDto;
import com.app.umkaSchool.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teachers")
@RequiredArgsConstructor
public class TeacherController {
    
    private final TeacherService teacherService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<List<TeacherDto>> getAllTeachers() {
        return ResponseEntity.ok(teacherService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ResponseEntity<TeacherDto> getTeacherById(@PathVariable UUID id) {
        return teacherService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#userId)")
    public ResponseEntity<TeacherDto> getTeacherByUserId(@PathVariable UUID userId) {
        return teacherService.findByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @teacherSecurity.isCurrentTeacher(#id)")
    public ResponseEntity<TeacherDto> updateTeacher(
            @PathVariable UUID id,
            @RequestBody TeacherDto teacherDto) {
        if (!id.equals(teacherDto.id())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(teacherService.save(teacherDto));
    }

    @PutMapping("/{id}/bio")
    @PreAuthorize("hasRole('ADMIN') or @teacherSecurity.isCurrentTeacher(#id)")
    public ResponseEntity<Void> updateBio(
            @PathVariable UUID id,
            @RequestParam String bio) {
        teacherService.updateBio(id, bio);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/phone")
    @PreAuthorize("hasRole('ADMIN') or @teacherSecurity.isCurrentTeacher(#id)")
    public ResponseEntity<Void> updatePhone(
            @PathVariable UUID id,
            @RequestParam String phone) {
        teacherService.updatePhone(id, phone);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTeacher(@PathVariable UUID id) {
        teacherService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}