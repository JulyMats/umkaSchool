package com.app.umkaSchool.config.security;

import com.app.umkaSchool.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class TeacherSecurity {

    private final TeacherService teacherService;

    public boolean isCurrentTeacher(UUID teacherId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Get the current user's ID from the authentication
        String userEmail = authentication.getName();
        
        // Find teacher by ID and check if it belongs to current user
        return teacherService.findById(teacherId)
                .map(teacher -> teacher.email().equals(userEmail))
                .orElse(false);
    }

    public boolean canAccessTeacherData(UUID teacherId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        // Allow if user is admin
        if (authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return true;
        }

        // Otherwise, check if current user is the teacher
        return isCurrentTeacher(teacherId);
    }
}