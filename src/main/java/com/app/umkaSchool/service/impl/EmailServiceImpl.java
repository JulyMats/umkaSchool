package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.name:UmkaSchool}")
    private String appName;

    @Override
    public void sendPasswordReset(String toEmail, String resetLink) {
        try {
            logger.info("Attempting to send password reset email to: {}", toEmail);
            logger.info("Reset link: {}", resetLink);
            logger.info("From email: {}", fromEmail);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Request - " + appName);

            String htmlContent = buildPasswordResetEmail(resetLink);
            helper.setText(htmlContent, true);

            logger.info("📤 Sending email to SMTP server...");
            mailSender.send(message);
            logger.info("✅ Password reset email sent successfully to: {}", toEmail);
            logger.info("🔍 If you don't see the email, check:");
            logger.info("   1. Spam/Junk folder");
            logger.info("   2. Promotions tab (Gmail)");
            logger.info("   3. Verify email address is correct: {}", toEmail);
            logger.info("   4. Check sender email is configured: {}", fromEmail);
        } catch (MessagingException e) {
            logger.error("❌ MessagingException - Failed to send password reset email to: {}", toEmail, e);
            // For development: print token to console as fallback
            logger.warn("=================================================");
            logger.warn("EMAIL SEND FAILED! Reset link: {}", resetLink);
            logger.warn("Error message: {}", e.getMessage());
            logger.warn("=================================================");
        } catch (Exception e) {
            logger.error("❌ Unexpected error sending password reset email to: {}", toEmail, e);
            logger.warn("=================================================");
            logger.warn("EMAIL SEND FAILED! Reset link: {}", resetLink);
            logger.warn("Error: {}", e.getMessage());
            logger.warn("=================================================");
        }
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String firstName, String lastName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Welcome to " + appName + "!");

            String htmlContent = buildWelcomeEmail(firstName, lastName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("Welcome email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            logger.error("Failed to send welcome email to: {}", toEmail, e);
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
}
