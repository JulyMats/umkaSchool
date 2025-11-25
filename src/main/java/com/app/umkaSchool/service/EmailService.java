package com.app.umkaSchool.service;

public interface EmailService {
    void sendPasswordReset(String toEmail, String resetLink);
    void sendWelcomeEmail(String toEmail, String firstName, String lastName);
}
