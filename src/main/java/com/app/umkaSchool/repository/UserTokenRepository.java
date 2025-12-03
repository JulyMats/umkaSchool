package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.UserToken;
import com.app.umkaSchool.model.UserToken.TokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserTokenRepository extends JpaRepository<UserToken, UUID> {
    Optional<UserToken> findByTokenHashAndTokenTypeAndUsedFalseAndExpiresAtAfter(
            String tokenHash,
            TokenType tokenType,
            ZonedDateTime now
    );

    Optional<UserToken> findByTokenHashAndTokenType(
            String tokenHash,
            TokenType tokenType
    );

    Optional<UserToken> findByUser_IdAndTokenTypeAndUsedFalseAndExpiresAtAfter(
            UUID userId,
            TokenType tokenType,
            ZonedDateTime now
    );

    List<UserToken> findByUser_Id(UUID userId);
}
