package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.admin.AdminDashboardResponse;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.StudentGroupRepository;
import com.app.umkaSchool.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.ZonedDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class AdminServiceTest {

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private StudentGroupRepository groupRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    @Test
    void getDashboardStatistics_ShouldReturnStatistics() {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime lastDay = now.minusDays(1);
        ZonedDateTime lastMonth = now.minusMonths(1);
        ZonedDateTime lastYear = now.minusYears(1);

        when(userRepository.countByUserRole(AppUser.UserRole.TEACHER)).thenReturn(10L);
        when(userRepository.countByUserRole(AppUser.UserRole.STUDENT)).thenReturn(50L);
        when(userRepository.countByUserRoleAndActive(AppUser.UserRole.TEACHER)).thenReturn(8L);
        when(userRepository.countByUserRoleAndActive(AppUser.UserRole.STUDENT)).thenReturn(45L);
        when(userRepository.countByCreatedAtAfter(any(ZonedDateTime.class))).thenReturn(5L);
        when(groupRepository.count()).thenReturn(15L);

        AdminDashboardResponse result = adminService.getDashboardStatistics();

        assertNotNull(result);
        assertEquals(10L, result.getTotalTeachers());
        assertEquals(50L, result.getTotalStudents());
        assertEquals(8L, result.getActiveTeachers());
        assertEquals(45L, result.getActiveStudents());
        assertEquals(15L, result.getTotalGroups());
        assertTrue(result.getNewUsersLastDay() >= 0);
        assertTrue(result.getNewUsersLastMonth() >= 0);
        assertTrue(result.getNewUsersLastYear() >= 0);
    }
}

