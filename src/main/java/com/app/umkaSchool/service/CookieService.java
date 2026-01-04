package com.app.umkaSchool.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public interface CookieService {
    void setJwtCookie(HttpServletResponse response, String token);
    void setRefreshTokenCookie(HttpServletResponse response, String token);
    String getRefreshTokenFromCookie(HttpServletRequest request);
    void clearAuthCookies(HttpServletResponse response);
}

