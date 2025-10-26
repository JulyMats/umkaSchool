/*
package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.auth.LoginRequest;
import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.model.UserToken;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.UserTokenRepository;
import com.app.umkaSchool.service.AuthService;
import com.app.umkaSchool.service.EmailService;
import com.app.umkaSchool.service.TokenService;
import com.app.umkaSchool.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final AppUserRepository userRepository;
    private final UserTokenRepository userTokenRepository;
    private final TokenService tokenService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

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
    public void signup(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }
        userService.createUser(request);
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
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            // do not reveal user existence
            return;
        }
        var user = userOpt.get();
        String rawToken = tokenService.generateToken();
        String hash = tokenService.hashToken(rawToken);
        UserToken token = new UserToken();
        token.setUser(user);
        token.setTokenHash(hash);
        token.setTokenType(UserToken.TokenType.PASSWORD_RESET);
        token.setCreatedAt(ZonedDateTime.now());
        token.setExpiresAt(ZonedDateTime.now().plusHours(2));
        token.setUsed(false);
        userTokenRepository.save(token);
        String resetLink = appBaseUrl + "/reset-password?token=" + rawToken;
        emailService.sendPasswordReset(user.getEmail(), resetLink);
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
}

*/
