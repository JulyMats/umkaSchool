package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.DailyChallenge;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyChallengeRepository extends JpaRepository<DailyChallenge, UUID> {
    @EntityGraph(attributePaths = {"exercises", "exercises.exercise", "exercises.exercise.exerciseType"})
    Optional<DailyChallenge> findByChallengeDate(LocalDate challengeDate);
    
    @EntityGraph(attributePaths = {"exercises", "exercises.exercise", "exercises.exercise.exerciseType"})
    Optional<DailyChallenge> findById(UUID id);
    
    boolean existsByChallengeDate(LocalDate challengeDate);
    
    @EntityGraph(attributePaths = {"exercises", "exercises.exercise", "exercises.exercise.exerciseType"})
    Optional<DailyChallenge> findFirstByOrderByChallengeDateDesc();
}

