package com.app.umkaSchool.util;

import com.app.umkaSchool.model.AppUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public class SecurityUtils {

    public static AppUser getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("No authenticated user found");
        }
        
        Object principal = authentication.getPrincipal();
        if (principal instanceof AppUser) {
            return (AppUser) principal;
        }
        
        throw new IllegalStateException("Principal is not an AppUser instance");
    }

    public static UUID getCurrentUserId() {
        return getCurrentUser().getId();
    }

    public static AppUser.UserRole getCurrentUserRole() {
        return getCurrentUser().getUserRole();
    }

    public static boolean isAdmin() {
        try {
            return getCurrentUserRole() == AppUser.UserRole.ADMIN;
        } catch (IllegalStateException e) {
            return false;
        }
    }

    public static boolean isTeacher() {
        try {
            return getCurrentUserRole() == AppUser.UserRole.TEACHER;
        } catch (IllegalStateException e) {
            return false;
        }
    }

    public static boolean isStudent() {
        try {
            return getCurrentUserRole() == AppUser.UserRole.STUDENT;
        } catch (IllegalStateException e) {
            return false;
        }
    }
}
