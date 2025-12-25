package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.admin.AdminDashboardResponse;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.StudentGroupRepository;
import com.app.umkaSchool.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;

@Service
public class AdminServiceImpl implements AdminService {

    private final AppUserRepository userRepository;
    private final StudentGroupRepository groupRepository;

    @Autowired
    public AdminServiceImpl(AppUserRepository userRepository, StudentGroupRepository groupRepository) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
    }

    @Override
    public AdminDashboardResponse getDashboardStatistics() {
        ZonedDateTime now = ZonedDateTime.now();
        ZonedDateTime oneDayAgo = now.minusDays(1);
        ZonedDateTime oneMonthAgo = now.minusMonths(1);
        ZonedDateTime oneYearAgo = now.minusYears(1);

        long totalTeachers = userRepository.countByUserRole(AppUser.UserRole.TEACHER);
        long totalStudents = userRepository.countByUserRole(AppUser.UserRole.STUDENT);
        long activeTeachers = userRepository.countByUserRoleAndActive(AppUser.UserRole.TEACHER);
        long activeStudents = userRepository.countByUserRoleAndActive(AppUser.UserRole.STUDENT);
        long totalGroups = groupRepository.count();
        long newUsersLastDay = userRepository.countByCreatedAtAfter(oneDayAgo);
        long newUsersLastMonth = userRepository.countByCreatedAtAfter(oneMonthAgo);
        long newUsersLastYear = userRepository.countByCreatedAtAfter(oneYearAgo);

        return AdminDashboardResponse.builder()
                .totalTeachers(totalTeachers)
                .totalStudents(totalStudents)
                .activeTeachers(activeTeachers)
                .activeStudents(activeStudents)
                .totalGroups(totalGroups)
                .newUsersLastDay(newUsersLastDay)
                .newUsersLastMonth(newUsersLastMonth)
                .newUsersLastYear(newUsersLastYear)
                .build();
    }
}

