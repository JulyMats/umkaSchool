package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.weeklyreport.WeeklyReportData;
import com.app.umkaSchool.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.Map;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String appName;
    private final String brevoApiKey;
    private final RestTemplate restTemplate;
    private final boolean useBrevo;

    @Autowired
    public EmailServiceImpl(JavaMailSender mailSender,
                            @Value("${spring.mail.username}") String fromEmail,
                            @Value("${app.name:UmkaSchool}") String appName,
                            @Value("${brevo.api.key:}") String brevoApiKey) {
        this.mailSender = mailSender;
        this.fromEmail = fromEmail;
        this.appName = appName;
        this.brevoApiKey = brevoApiKey;
        this.restTemplate = new RestTemplate();
        this.useBrevo = brevoApiKey != null && !brevoApiKey.trim().isEmpty();
        
        if (useBrevo) {
            logger.info("Email service configured to use Brevo API (production mode)");
        } else {
            logger.info("Email service configured to use SMTP (development mode)");
        }
    }

    @Override
    public void sendPasswordReset(String toEmail, String resetLink) {
        String subject = "Password Reset Request - " + appName;
        String htmlContent = buildPasswordResetEmail(resetLink);
        
        if (useBrevo) {
            sendViaBrevo(toEmail, subject, htmlContent);
        } else {
            sendViaSmtp(toEmail, subject, htmlContent);
        }
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String firstName, String lastName) {
        String subject = "Welcome to " + appName + "!";
        String htmlContent = buildWelcomeEmail(firstName, lastName);
        
        if (useBrevo) {
            sendViaBrevo(toEmail, subject, htmlContent);
        } else {
            sendViaSmtp(toEmail, subject, htmlContent);
        }
    }

    @Override
    public void sendWeeklyReport(String guardianEmail, String guardianFirstName, WeeklyReportData reportData) {
        String subject = "Weekly Progress Report for " + reportData.getStudentFirstName() + " - " + appName;
        String htmlContent = buildWeeklyReportEmail(guardianFirstName, reportData);
        
        if (useBrevo) {
            sendViaBrevo(guardianEmail, subject, htmlContent);
        } else {
            sendViaSmtp(guardianEmail, subject, htmlContent);
        }
    }

    private void sendViaBrevo(String toEmail, String subject, String htmlContent) {
        try {
            logger.info("Attempting to send email via Brevo API to: {}", toEmail);
            
            if (brevoApiKey == null || brevoApiKey.isEmpty()) {
                logger.error("Brevo API key is not configured!");
                return;
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            Map<String, Object> sender = Map.of("email", fromEmail);
            Map<String, Object> to = Map.of("email", toEmail);
            Map<String, Object> requestBody = Map.of(
                    "sender", sender,
                    "to", java.util.List.of(to),
                    "subject", subject,
                    "htmlContent", htmlContent
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    "https://api.brevo.com/v3/smtp/email",
                    HttpMethod.POST,
                    request,
                    String.class
            );

            logger.info("Email sent successfully via Brevo API to: {}. Status: {}", toEmail, response.getStatusCode());
        } catch (Exception e) {
            logger.error("Failed to send email via Brevo API to: {}", toEmail, e);
            logger.warn("=================================================");
            logger.warn("EMAIL SEND FAILED VIA BREVO API!");
            logger.warn("Error: {}", e.getMessage());
            logger.warn("=================================================");
        }
    }

    private void sendViaSmtp(String toEmail, String subject, String htmlContent) {
        try {
            logger.info("Attempting to send email via SMTP to: {}", toEmail);
            logger.info("From email: {}", fromEmail);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            logger.info("Sending email to SMTP server...");
            mailSender.send(message);
            logger.info("Email sent successfully via SMTP to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("MessagingException - Failed to send email via SMTP to: {}", toEmail, e);
            logger.warn("=================================================");
            logger.warn("EMAIL SEND FAILED VIA SMTP!");
            logger.warn("Error message: {}", e.getMessage());
            logger.warn("=================================================");
        } catch (Exception e) {
            logger.error("Unexpected error sending email via SMTP to: {}", toEmail, e);
            logger.warn("=================================================");
            logger.warn("EMAIL SEND FAILED VIA SMTP!");
            logger.warn("Error: {}", e.getMessage());
            logger.warn("=================================================");
        }
    }

    private String buildPasswordResetEmail(String resetLink) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; }
                        .button { display: inline-block; padding: 12px 30px; background-color: #4CAF50; 
                                 color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>""" + appName + """
                </h1>
                        </div>
                        <div class="content">
                            <h2>Password Reset Request</h2>
                            <p>Hello,</p>
                            <p>We received a request to reset your password. Click the button below to create a new password:</p>
                            <p style="text-align: center;">
                                <a href=\"""" + resetLink + """
                " class="button">Reset Password</a>
                            </p>
                            <p>Or copy and paste this link into your browser:</p>
                            <p style="word-break: break-all; color: #666;">""" + resetLink + """
                </p>
                            <p><strong>This link will expire in 2 hours.</strong></p>
                            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 """ + appName + """
                . All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """;
    }

    private String buildWelcomeEmail(String firstName, String lastName) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
                        .content { background-color: #f9f9f9; padding: 30px; }
                        .features { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
                        .feature-item { margin: 15px 0; padding-left: 25px; }
                        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Welcome to """ + appName + """
                !</h1>
                        </div>
                        <div class="content">
                            <h2>Hello """ + firstName + " " + lastName + """
                !</h2>
                            <p>Thank you for joining """ + appName + """
                . We're excited to have you on board!</p>
                            <p>Your account has been successfully created and you can now start your learning journey.</p>
                            
                            <div class="features">
                                <h3>What you can do now:</h3>
                                <div class="feature-item">✓ Complete daily challenges to improve your skills</div>
                                <div class="feature-item">✓ Track your progress and achievements</div>
                                <div class="feature-item">✓ Access homework assignments</div>
                                <div class="feature-item">✓ Connect with teachers and peers</div>
                            </div>
                            
                            <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>
                            <p>Happy learning!</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 """ + appName + """
                . All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """;
    }

    private String buildWeeklyReportEmail(String guardianFirstName, WeeklyReportData reportData) {
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("MMM dd, yyyy");
        String weekRange = reportData.getWeekStartDate().format(dateFormatter) + " - " + 
                          reportData.getWeekEndDate().format(dateFormatter);
        
        String practiceTime = formatTime(reportData.getPracticeTimeSeconds());
        
        double homeworkCompletionRate = reportData.getTotalHomeworkCount() > 0 
            ? (double) reportData.getCompletedHomeworkCount() * 100.0 / reportData.getTotalHomeworkCount()
            : 0.0;
        
        StringBuilder subjectProgressHtml = new StringBuilder();
        if (reportData.getSubjectProgress() != null && !reportData.getSubjectProgress().isEmpty()) {
            for (WeeklyReportData.SubjectProgress subject : reportData.getSubjectProgress()) {
                subjectProgressHtml.append("""
                    <div style="background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4CAF50;">
                        <h3 style="margin: 0 0 10px 0; color: #333;">%s</h3>
                        <p style="margin: 5px 0;"><strong>Problems Solved:</strong> %d</p>
                        <p style="margin: 5px 0;"><strong>Accuracy:</strong> %d%%</p>
                        <p style="margin: 5px 0;"><strong>Practice Time:</strong> %s</p>
                    </div>
                    """.formatted(
                    subject.getSubjectName(),
                    subject.getProblemsSolved(),
                    subject.getAccuracyRate(),
                    formatTime(subject.getPracticeTimeSeconds())
                ));
            }
        } else {
            subjectProgressHtml.append("<p style='color: #666;'>No activity in any subjects this week.</p>");
        }
        
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
                        .header { background-color: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 5px 5px 0 0; }
                        .content { background-color: #f9f9f9; padding: 30px; }
                        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
                        .stat-card { background-color: white; padding: 20px; border-radius: 5px; text-align: center; }
                        .stat-value { font-size: 32px; font-weight: bold; color: #4CAF50; margin: 10px 0; }
                        .stat-label { font-size: 14px; color: #666; }
                        .section { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
                        .section-title { color: #4CAF50; margin-top: 0; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
                        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Weekly Progress Report</h1>
                            <p style="margin: 0; font-size: 18px;">%s</p>
                        </div>
                        <div class="content">
                            <p>Hello, %s!</p>
                            <p>Here is the weekly progress report for your child <strong>%s %s</strong> 
                            for the period <strong>%s</strong>.</p>
                            
                            <div class="section">
                                <h2 class="section-title">Key Statistics</h2>
                                <div class="stats-grid">
                                    <div class="stat-card">
                                        <div class="stat-value">%d</div>
                                        <div class="stat-label">Problems Solved</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">%d%%</div>
                                        <div class="stat-label">Accuracy</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">%s</div>
                                        <div class="stat-label">Practice Time</div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-value">%d</div>
                                        <div class="stat-label">Days in a Row</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="section">
                                <h2 class="section-title">Homework</h2>
                                <p><strong>Completed:</strong> %d out of %d assignments</p>
                                <p><strong>Completion Rate:</strong> %.1f%%</p>
                            </div>
                            
                            <div class="section">
                                <h2 class="section-title">Progress by Subject</h2>
                                %s
                            </div>
                            
                            <p>Thank you for your support in your child's learning journey!</p>
                            <p>If you have any questions, please feel free to contact us.</p>
                        </div>
                        <div class="footer">
                            <p>© 2025 %s. All rights reserved.</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
                """.formatted(
                weekRange,
                guardianFirstName,
                reportData.getStudentFirstName(),
                reportData.getStudentLastName(),
                weekRange,
                reportData.getProblemsSolved(),
                reportData.getAccuracyRate(),
                practiceTime,
                reportData.getCurrentStreak(),
                reportData.getCompletedHomeworkCount(),
                reportData.getTotalHomeworkCount(),
                homeworkCompletionRate,
                subjectProgressHtml.toString(),
                appName
        );
    }

    private String formatTime(Long seconds) {
        if (seconds == null || seconds == 0) {
            return "0 min";
        }
        long hours = seconds / 3600;
        long minutes = (seconds % 3600) / 60;
        
        if (hours > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else {
            return String.format("%dm", minutes);
        }
    }
}
