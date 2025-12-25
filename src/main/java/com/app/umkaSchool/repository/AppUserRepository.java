package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppUserRepository extends JpaRepository<AppUser, UUID> {
    Optional<AppUser> findByEmail(String email);
    boolean existsByEmail(String email);
    
    long countByUserRole(AppUser.UserRole role);
    
    @Query("SELECT COUNT(u) FROM AppUser u WHERE u.userRole = :role AND u.createdAt >= :startDate")
    long countByUserRoleAndCreatedAtAfter(@Param("role") AppUser.UserRole role, @Param("startDate") ZonedDateTime startDate);
    
    @Query("SELECT COUNT(u) FROM AppUser u WHERE u.createdAt >= :startDate")
    long countByCreatedAtAfter(@Param("startDate") ZonedDateTime startDate);
    
    @Query("SELECT COUNT(u) FROM AppUser u WHERE u.userRole = :role AND u.active = true")
    long countByUserRoleAndActive(@Param("role") AppUser.UserRole role);
}
