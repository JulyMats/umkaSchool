package com.app.umkaSchool.security.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {
    
    private final JavaMailSender emailSender;

    public void sendPasswordResetEmail(String to, String token) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Password Reset Request");
        message.setText("To reset your password, click the link below:\n\n" +
                "http://localhost:5173/reset-password?token=" + token + "\n\n" +
                "If you didn't request a password reset, please ignore this email.\n\n" +
                "This link will expire in 24 hours.");
        
        emailSender.send(message);
    }

    public void sendWelcomeEmail(String to, String firstName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Welcome to UmkaSchool!");
        message.setText("Dear " + firstName + ",\n\n" +
                "Welcome to UmkaSchool! We're excited to have you on board.\n\n" +
                "Best regards,\nThe UmkaSchool Team");
        
        emailSender.send(message);
    }
}