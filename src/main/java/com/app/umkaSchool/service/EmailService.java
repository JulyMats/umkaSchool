package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.weeklyreport.WeeklyReportData;

public interface EmailService {
    void sendPasswordReset(String toEmail, String resetLink);
    void sendWelcomeEmail(String toEmail, String firstName, String lastName);
    void sendWeeklyReport(String guardianEmail, String guardianFirstName, WeeklyReportData reportData);
}
