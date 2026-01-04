package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.service.CookieService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class CookieServiceImpl implements CookieService {

    private static final String JWT_COOKIE_NAME = "jwtToken";
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    @Value("${jwt.expiration:86400000}")
    private long jwtExpirationMs;

    @Value("${auth.refresh-token.expiration-days:30}")
    private int refreshTokenExpirationDays;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Override
    public void setJwtCookie(HttpServletResponse response, String token) {
        Cookie jwtCookie = new Cookie(JWT_COOKIE_NAME, token);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(cookieSecure);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge((int) (jwtExpirationMs / 1000));
        response.addCookie(jwtCookie);
    }

    @Override
    public void setRefreshTokenCookie(HttpServletResponse response, String token) {
        Cookie refreshCookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, token);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(cookieSecure);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenExpirationDays * 24 * 60 * 60);
        response.addCookie(refreshCookie);
    }

    @Override
    public String getRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (REFRESH_TOKEN_COOKIE_NAME.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    @Override
    public void clearAuthCookies(HttpServletResponse response) {
        Cookie jwtCookie = new Cookie(JWT_COOKIE_NAME, null);
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(cookieSecure);
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0);
        response.addCookie(jwtCookie);

        Cookie refreshCookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(cookieSecure);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);
    }
}

