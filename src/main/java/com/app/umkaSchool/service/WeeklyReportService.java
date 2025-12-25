package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.weeklyreport.WeeklyReportData;

import java.time.LocalDate;
import java.util.UUID;

public interface WeeklyReportService {
    
    WeeklyReportData generateWeeklyReport(UUID studentId, LocalDate weekStartDate, LocalDate weekEndDate);
    void sendWeeklyReportsToAllGuardians();
}