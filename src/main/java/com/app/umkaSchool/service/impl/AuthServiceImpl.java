package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.LoginResponse;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.auth.SignupResponse;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.UserToken;
import com.app.umkaSchool.repository.UserTokenRepository;
import com.app.umkaSchool.service.AuthService;
import com.app.umkaSchool.service.EmailService;
import com.app.umkaSchool.service.TokenService;
import com.app.umkaSchool.service.UserService;
import com.app.umkaSchool.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final UserService userService;
    private final UserTokenRepository userTokenRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${auth.refresh-token.expiration-days:30}")
    private Integer refreshTokenExpirationDays;

    @Value("${auth.password-reset.expiration-hours:2}")
    private Integer passwordResetExpirationHours;

    @Autowired
    public AuthServiceImpl(UserService userService,
                           UserTokenRepository userTokenRepository,
                           TokenService tokenService,
                           EmailService emailService,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userService = userService;
        this.userTokenRepository = userTokenRepository;
        this.tokenService = tokenService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public SignupResponse signup(RegisterRequest request) {
        if (userService.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }
        
        // Create user account only - profile creation (Student/Teacher) is handled by controller
        AppUser user = userService.createUser(request);

        return SignupResponse.builder()
            .id(user.getId())
            .role(user.getUserRole().name())
            .build();
    }

    @Override
    @Transactional
    public LoginResponse signin(LoginRequest request) {
        Optional<AppUser> userOpt = userService.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty()) {
            logger.warn("User not found for email: {}", request.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        }
        
        AppUser user = userOpt.get();
        boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
        logger.info("Password match result for user {}: {}", user.getEmail(), passwordMatches);
        
        if (!passwordMatches) {
            logger.warn("Password mismatch for email: {}", request.getEmail());
            throw new IllegalArgumentException("Invalid email or password");
        }
        
        if (!user.isActive()) {
            logger.warn("Inactive account login attempt for email: {}", request.getEmail());
            throw new IllegalArgumentException("Account is inactive. Please contact support.");
        }

        // Generate JWT access token
        String jwtToken = jwtUtil.generateToken(
            user.getEmail(),
            user.getId().toString(),
            user.getUserRole().name()
        );

        // Generate and save refresh token for token revocation
        String refreshToken = tokenService.generateToken();
        String refreshTokenHash = tokenService.hashToken(refreshToken);
        UserToken refreshTokenEntity = new UserToken();
        refreshTokenEntity.setUser(user);
        refreshTokenEntity.setTokenHash(refreshTokenHash);
        refreshTokenEntity.setTokenType(UserToken.TokenType.REFRESH_TOKEN);
        refreshTokenEntity.setCreatedAt(ZonedDateTime.now());
        refreshTokenEntity.setExpiresAt(ZonedDateTime.now().plusDays(refreshTokenExpirationDays));
        refreshTokenEntity.setUsed(false);
        userTokenRepository.save(refreshTokenEntity);

        user.setLastLoginAt(ZonedDateTime.now());

        // Build response with user info
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(user.getId().toString())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getUserRole().name())
            .build();

        return LoginResponse.builder()
            .jwtToken(jwtToken)
            .refreshToken(refreshToken)
            .user(userInfo)
            .build();
    }

    @Override
    @Transactional
    public void forgotPassword(String email, String appBaseUrl) {
        logger.info("Password reset requested for email: {}", email);

        Optional<AppUser> userOpt = userService.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            logger.info("Password reset requested for non-existent email: {}", email);
            return;
        }

        AppUser user = userOpt.get();
        logger.debug("Processing password reset for user: {}", user.getId());

        String rawToken = tokenService.generateToken();
        String hash = tokenService.hashToken(rawToken);

        UserToken token = new UserToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setTokenType(UserToken.TokenType.PASSWORD_RESET);
        token.setCreatedAt(ZonedDateTime.now());
        token.setExpiresAt(ZonedDateTime.now().plusHours(passwordResetExpirationHours));
        token.setUsed(false);
        userTokenRepository.save(token);
        
        logger.debug("Password reset token created for user: {}", user.getId());

        String baseUrl = (appBaseUrl == null || appBaseUrl.trim().isEmpty())
            ? frontendUrl
            : appBaseUrl;

        String resetLink = baseUrl + "/reset-password?token=" + rawToken;
        logger.debug("Sending password reset email to: {}", email);

        emailService.sendPasswordReset(user.getEmail(), resetLink);
        logger.info("Password reset email sent successfully");
    }

    @Override
    @Transactional
    public void resetPassword(String token, String newPassword) {
        String hash = tokenService.hashToken(token);
        Optional<UserToken> tokenOpt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                hash,
                UserToken.TokenType.PASSWORD_RESET,
                ZonedDateTime.now()
        );
        
        UserToken userToken = tokenOpt.orElseThrow(() -> 
            new IllegalArgumentException("Invalid or expired password reset token"));
        
        AppUser user = userToken.getUser();
        userService.updatePassword(user.getId(), newPassword);
        
        userToken.setUsed(true);
        userTokenRepository.save(userToken);
        
        logger.info("Password reset completed for user: {}", user.getId());
    }

    @Override
    @Transactional
    public LoginResponse refreshToken(String refreshToken) {
        String hash = tokenService.hashToken(refreshToken);
        Optional<UserToken> tokenOpt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                hash,
                UserToken.TokenType.REFRESH_TOKEN,
                ZonedDateTime.now()
        );

        if (tokenOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }

        UserToken userToken = tokenOpt.get();
        AppUser user = userToken.getUser();

        if (!user.isActive()) {
            throw new IllegalArgumentException("Account is inactive");
        }

        // Generate new JWT access token
        String jwtToken = jwtUtil.generateToken(
            user.getEmail(),
            user.getId().toString(),
            user.getUserRole().name()
        );

        // Build response with user info
        LoginResponse.UserInfo userInfo = LoginResponse.UserInfo.builder()
            .id(user.getId().toString())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .email(user.getEmail())
            .role(user.getUserRole().name())
            .build();

        return LoginResponse.builder()
            .jwtToken(jwtToken)
            .refreshToken(refreshToken) // Return same refresh token
            .user(userInfo)
            .build();
    }

    @Override
    @Transactional
    public void logout(String refreshToken) {
        logger.debug("Logout requested");

        String hash = tokenService.hashToken(refreshToken);
        Optional<UserToken> tokenOpt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                hash,
                UserToken.TokenType.REFRESH_TOKEN,
                ZonedDateTime.now()
        );

        if (tokenOpt.isEmpty()) {
            logger.debug("Refresh token not found or already expired - logout ignored");
            return;
        }

        UserToken userToken = tokenOpt.get();
        userToken.setUsed(true);
        userTokenRepository.save(userToken);
        logger.info("User logged out successfully - refresh token revoked");
    }
}
