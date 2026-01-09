package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.service.CookieService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
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

    @Value("${app.cookie.same-site:None}")
    private String cookieSameSite;

    private String getSameSiteValue() {
        String normalized = cookieSameSite.trim();
        if (normalized.equalsIgnoreCase("None") || normalized.equalsIgnoreCase("Lax") || normalized.equalsIgnoreCase("Strict")) {
            return normalized.substring(0, 1).toUpperCase() + normalized.substring(1).toLowerCase();
        }
        return "None"; 
    }

    @Override
    public void setJwtCookie(HttpServletResponse response, String token) {
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(JWT_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(jwtExpirationMs / 1000);
        
        String cookieString = cookieBuilder.build().toString();
        cookieString += "; SameSite=" + getSameSiteValue();
        
        response.addHeader("Set-Cookie", cookieString);
    }

    @Override
    public void setRefreshTokenCookie(HttpServletResponse response, String token) {
        ResponseCookie.ResponseCookieBuilder cookieBuilder = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(refreshTokenExpirationDays * 24 * 60 * 60);
        
        String cookieString = cookieBuilder.build().toString();
        cookieString += "; SameSite=" + getSameSiteValue();
        
        response.addHeader("Set-Cookie", cookieString);
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
        ResponseCookie.ResponseCookieBuilder jwtCookieBuilder = ResponseCookie.from(JWT_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0);
        
        ResponseCookie.ResponseCookieBuilder refreshCookieBuilder = ResponseCookie.from(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0);
        
        String jwtCookieString = jwtCookieBuilder.build().toString() + "; SameSite=" + getSameSiteValue();
        String refreshCookieString = refreshCookieBuilder.build().toString() + "; SameSite=" + getSameSiteValue();
        
        response.addHeader("Set-Cookie", jwtCookieString);
        response.addHeader("Set-Cookie", refreshCookieString);
    }
}

