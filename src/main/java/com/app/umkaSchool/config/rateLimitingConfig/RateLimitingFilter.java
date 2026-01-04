package com.app.umkaSchool.config.rateLimitingConfig;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(RateLimitingFilter.class);

    private final Bucket authRateLimiter;
    private final Bucket apiRateLimiter;
    private final Bucket strictRateLimiter;
    private final Map<String, Bucket> ipRateLimitBuckets;

    @Value("${rate.limit.auth.requests:10}")
    private int authRequests;

    @Value("${rate.limit.auth.window.seconds:60}")
    private int authWindowSeconds;

    @Value("${rate.limit.api.requests:100}")
    private int apiRequests;

    @Value("${rate.limit.api.window.seconds:60}")
    private int apiWindowSeconds;

    @Value("${rate.limit.strict.requests:5}")
    private int strictRequests;

    @Value("${rate.limit.strict.window.seconds:60}")
    private int strictWindowSeconds;

    @Value("${rate.limit.per.ip.enabled:true}")
    private boolean perIpEnabled;

    @Autowired
    public RateLimitingFilter(
            @Qualifier("authRateLimiter") Bucket authRateLimiter,
            @Qualifier("apiRateLimiter") Bucket apiRateLimiter,
            @Qualifier("strictRateLimiter") Bucket strictRateLimiter,
            Map<String, Bucket> ipRateLimitBuckets) {
        this.authRateLimiter = authRateLimiter;
        this.apiRateLimiter = apiRateLimiter;
        this.strictRateLimiter = strictRateLimiter;
        this.ipRateLimitBuckets = ipRateLimitBuckets;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();
        String clientIp = getClientIpAddress(request);

        Bucket bucket = selectBucket(requestPath, clientIp);

        if (!bucket.tryConsume(1)) {
            logger.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, requestPath);
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType("application/json");
            response.setHeader("Retry-After", String.valueOf(getWindowSeconds(requestPath)));
            response.getWriter().write("{\"error\":\"Too many requests. Please try again later.\",\"status\":429}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    private Bucket selectBucket(String requestPath, String clientIp) {
        if (!perIpEnabled) {
            return getGlobalBucket(requestPath);
        }

        if (requestPath.startsWith("/api/auth/")) {
            return getOrCreateIpBucket(clientIp, requestPath);
        }

        return getGlobalBucket(requestPath);
    }

    private Bucket getGlobalBucket(String requestPath) {
        if (requestPath.startsWith("/api/auth/signin") || 
            requestPath.startsWith("/api/auth/signup") ||
            requestPath.startsWith("/api/auth/forgot-password")) {
            return authRateLimiter;
        }

        if (requestPath.startsWith("/api/auth/reset-password") ||
            requestPath.startsWith("/api/auth/refresh")) {
            return strictRateLimiter;
        }

        if (requestPath.startsWith("/api/")) {
            return apiRateLimiter;
        }

        return apiRateLimiter;
    }

    private Bucket getOrCreateIpBucket(String clientIp, String requestPath) {
        String bucketKey = clientIp + ":" + getBucketType(requestPath);
        
        return ipRateLimitBuckets.computeIfAbsent(bucketKey, key -> {
            int requests = getRequestsForPath(requestPath);
            int windowSeconds = getWindowSeconds(requestPath);
            
            return Bucket.builder()
                    .addLimit(Bandwidth.classic(requests, 
                            Refill.intervally(requests, Duration.ofSeconds(windowSeconds))))
                    .build();
        });
    }

    private String getBucketType(String requestPath) {
        if (requestPath.startsWith("/api/auth/signin") || 
            requestPath.startsWith("/api/auth/signup") ||
            requestPath.startsWith("/api/auth/forgot-password")) {
            return "auth";
        }
        if (requestPath.startsWith("/api/auth/reset-password") ||
            requestPath.startsWith("/api/auth/refresh")) {
            return "strict";
        }
        return "api";
    }

    private int getRequestsForPath(String requestPath) {
        if (requestPath.startsWith("/api/auth/signin") || 
            requestPath.startsWith("/api/auth/signup") ||
            requestPath.startsWith("/api/auth/forgot-password")) {
            return authRequests;
        }
        if (requestPath.startsWith("/api/auth/reset-password") ||
            requestPath.startsWith("/api/auth/refresh")) {
            return strictRequests;
        }
        return apiRequests;
    }

    private int getWindowSeconds(String requestPath) {
        if (requestPath.startsWith("/api/auth/signin") || 
            requestPath.startsWith("/api/auth/signup") ||
            requestPath.startsWith("/api/auth/forgot-password")) {
            return authWindowSeconds;
        }
        if (requestPath.startsWith("/api/auth/reset-password") ||
            requestPath.startsWith("/api/auth/refresh")) {
            return strictWindowSeconds;
        }
        return apiWindowSeconds;
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }
}
