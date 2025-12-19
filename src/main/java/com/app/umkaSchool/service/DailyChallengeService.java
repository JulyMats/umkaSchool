package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.dailychallenge.CreateDailyChallengeRequest;
import com.app.umkaSchool.dto.dailychallenge.DailyChallengeResponse;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DailyChallengeService {
    DailyChallengeResponse createDailyChallenge(CreateDailyChallengeRequest request);
    DailyChallengeResponse getDailyChallengeById(UUID challengeId);
    DailyChallengeResponse getDailyChallengeByDate(LocalDate date);
    DailyChallengeResponse getTodayChallenge();
    List<DailyChallengeResponse> getAllDailyChallenges();
    void deleteDailyChallenge(UUID challengeId);
    void createTodayChallengeIfNotExists();
}

