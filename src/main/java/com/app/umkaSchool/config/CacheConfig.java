package com.app.umkaSchool.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${cache.user.ttl:600}")
    private Long userCacheTtl; 

    @Value("${cache.user.maxSize:250}")
    private Integer userCacheMaxSize; 

    @Value("${cache.exerciseType.ttl:3600}")
    private Long exerciseTypeCacheTtl; 

    @Value("${cache.exerciseType.maxSize:100}")
    private Integer exerciseTypeCacheMaxSize; 

    @Value("${cache.achievement.ttl:3600}")
    private Long achievementCacheTtl; 

    @Value("${cache.achievement.maxSize:100}")
    private Integer achievementCacheMaxSize; 

    @Value("${cache.studentGroup.ttl:1800}")
    private Long studentGroupCacheTtl; 

    @Value("${cache.studentGroup.maxSize:200}")
    private Integer studentGroupCacheMaxSize; 

    @Bean
    public CacheManager cacheManager() {
        SimpleCacheManager cacheManager = new SimpleCacheManager();
        
        cacheManager.setCaches(Arrays.asList(
            buildCache("users", userCacheMaxSize, userCacheTtl),
            buildCache("exerciseTypes", exerciseTypeCacheMaxSize, exerciseTypeCacheTtl),
            buildCache("achievements", achievementCacheMaxSize, achievementCacheTtl),
            buildCache("studentGroups", studentGroupCacheMaxSize, studentGroupCacheTtl)
        ));
        
        return cacheManager;
    }

    private CaffeineCache buildCache(String name, Integer maxSize, Long ttl) {
        return new CaffeineCache(
            name,
            Caffeine.newBuilder()
                .maximumSize(maxSize)
                .expireAfterWrite(ttl, TimeUnit.SECONDS)
                .recordStats()
                .build()
        );
    }
}

