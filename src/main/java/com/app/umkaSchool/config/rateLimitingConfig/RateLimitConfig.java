package com.app.umkaSchool.config.rateLimitingConfig;

import com.bucket4j.Bandwidth;
import com.bucket4j.Bucket;
import com.bucket4j.Refill;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Configuration
public class RateLimitConfig {

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

    @Bean(name = "authRateLimiter")
    public Bucket authRateLimiter() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(authRequests, Refill.intervally(authRequests, Duration.ofSeconds(authWindowSeconds))))
                .build();
    }

    @Bean(name = "apiRateLimiter")
    public Bucket apiRateLimiter() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(apiRequests, Refill.intervally(apiRequests, Duration.ofSeconds(apiWindowSeconds))))
                .build();
    }

    @Bean(name = "strictRateLimiter")
    public Bucket strictRateLimiter() {
        return Bucket.builder()
                .addLimit(Bandwidth.classic(strictRequests, Refill.intervally(strictRequests, Duration.ofSeconds(strictWindowSeconds))))
                .build();
    }
    
    @Bean
    public Map<String, Bucket> ipRateLimitBuckets() {
        return new ConcurrentHashMap<>();
    }
}

