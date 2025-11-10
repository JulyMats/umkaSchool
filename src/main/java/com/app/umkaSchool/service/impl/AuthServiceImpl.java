package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.auth.SignupResponse;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.UserToken;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.UserTokenRepository;
import com.app.umkaSchool.service.AuthService;
import com.app.umkaSchool.service.EmailService;
import com.app.umkaSchool.service.TokenService;
import com.app.umkaSchool.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserService userService;
    private final AppUserRepository userRepository;
    private final UserTokenRepository userTokenRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Autowired
    public AuthServiceImpl(UserService userService,
                           AppUserRepository userRepository,
                           UserTokenRepository userTokenRepository,
                           TokenService tokenService,
                           EmailService emailService,
                           PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.userTokenRepository = userTokenRepository;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public SignupResponse signup(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        AppUser user = userService.createUser(request);

        // Send welcome email after successful signup
        emailService.sendWelcomeEmail(
            request.getEmail(),
            request.getFirstName(),
            request.getLastName()
        );

        return SignupResponse.builder()
            .id(user.getId())
            .role(user.getUserRole().name())
            .build();
    }

    @Override
    public String signin(LoginRequest request) {
        Optional.ofNullable(request.getEmail()).orElseThrow(() -> new IllegalArgumentException("Email required"));
        Optional.ofNullable(request.getPassword()).orElseThrow(() -> new IllegalArgumentException("Password required"));

        var userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) throw new IllegalArgumentException("Invalid credentials");
        var user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        // generate a token to return (not a JWT). Save as REFRESH_TOKEN for simplicity.
        String rawToken = tokenService.generateToken();
        String hash = tokenService.hashToken(rawToken);
        UserToken token = new UserToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setTokenType(UserToken.TokenType.REFRESH_TOKEN);
        token.setCreatedAt(ZonedDateTime.now());
        token.setExpiresAt(ZonedDateTime.now().plusDays(30));
        token.setUsed(false);
        userTokenRepository.save(token);
        return rawToken;
    }

    @Override
    public void forgotPassword(String email, String appBaseUrl) {
        logger.info("🔐 Password reset requested for email: {}", email);
        logger.info("App base URL: {}", appBaseUrl);

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            logger.info("❌ User not found with email: {}", email);
            // do not reveal user existence
            return;
        }

        var user = userOpt.get();
        logger.info("✅ User found: {} {}", user.getFirstName(), user.getLastName());

        String rawToken = tokenService.generateToken();
        String hash = tokenService.hashToken(rawToken);

        // TODO: REMOVE BEFORE PRODUCTION! Logging for testing purposes
        System.out.println("=================================================");
        System.out.println("PASSWORD RESET TOKEN FOR: " + email);
        System.out.println("TOKEN: " + rawToken);
        System.out.println("=================================================");

        UserToken token = new UserToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setTokenType(UserToken.TokenType.PASSWORD_RESET);
        token.setCreatedAt(ZonedDateTime.now());
        token.setExpiresAt(ZonedDateTime.now().plusHours(2));
        token.setUsed(false);
        userTokenRepository.save(token);

        logger.info("✅ Token saved to database");

        // Use configured frontend URL if appBaseUrl is empty or null
        String baseUrl = (appBaseUrl == null || appBaseUrl.trim().isEmpty())
            ? frontendUrl
            : appBaseUrl;

        String resetLink = baseUrl + "/reset-password?token=" + rawToken;
        logger.info("📧 Sending email with reset link: {}", resetLink);

        emailService.sendPasswordReset(user.getEmail(), resetLink);

        logger.info("📬 Email service call completed");
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        String hash = tokenService.hashToken(token);
        var opt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                hash,
                UserToken.TokenType.PASSWORD_RESET,
                ZonedDateTime.now()
        );
        var ut = opt.orElseThrow(() -> new IllegalArgumentException("Invalid or expired token"));
        var user = ut.getUser();
        userService.updatePassword(user, newPassword);
        ut.setUsed(true);
        userTokenRepository.save(ut);
    }

    @Override
    public void logout(String token) {
        logger.info("🔓 Logout requested");

        String hash = tokenService.hashToken(token);
        var opt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                hash,
                UserToken.TokenType.REFRESH_TOKEN,
                ZonedDateTime.now()
        );

        if (opt.isEmpty()) {
            logger.warn("❌ Token not found or already expired");
            throw new IllegalArgumentException("Invalid or expired token");
        }

        var userToken = opt.get();
        userToken.setUsed(true);
        userTokenRepository.save(userToken);

        logger.info("✅ User logged out successfully");
    }
}
