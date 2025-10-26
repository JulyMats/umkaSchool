/*
package com.app.umkaSchool.config.securityConfig;

import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.UserToken;
import com.app.umkaSchool.repository.UserTokenRepository;
import com.app.umkaSchool.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.ZonedDateTime;

public class TokenAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(TokenAuthenticationFilter.class);

    private final TokenService tokenService;
    private final UserTokenRepository userTokenRepository;

    public TokenAuthenticationFilter(TokenService tokenService, UserTokenRepository userTokenRepository) {
        this.tokenService = tokenService;
        this.userTokenRepository = userTokenRepository;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        // Skip auth endpoints (they're public)
        return path.startsWith("/api/auth/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String header = request.getHeader("Authorization");
            if (header != null && header.startsWith("Bearer ")) {
                String rawToken = header.substring(7);
                String hash = tokenService.hashToken(rawToken);
                var opt = userTokenRepository.findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
                        hash,
                        UserToken.TokenType.REFRESH_TOKEN,
                        ZonedDateTime.now()
                );
                if (opt.isPresent()) {
                    UserToken userToken = opt.get();
                    AppUser user = userToken.getUser();
                    if (user != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                }
            }
        } catch (Exception ex) {
            // Do not fail the request on token parsing errors; just log and continue as unauthenticated
            logger.warn("Token authentication error: {}", ex.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}

*/
