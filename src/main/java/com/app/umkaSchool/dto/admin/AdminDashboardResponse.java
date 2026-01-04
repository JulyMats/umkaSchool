package com.app.umkaSchool.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalTeachers;
    private long totalStudents;
    private long activeTeachers;
    private long activeStudents;
    private long totalGroups;
    private long newUsersLastDay;
    private long newUsersLastMonth;
    private long newUsersLastYear;
}

