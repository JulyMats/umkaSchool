package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Override
    public void sendPasswordReset(String toEmail, String resetLink) {
        // Simple stub - in real app integrate with SMTP / external provider
        logger.info("Sending password reset to {}. Reset link: {}", toEmail, resetLink);
    }
}

