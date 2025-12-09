package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.dailychallenge.CreateDailyChallengeRequest;
import com.app.umkaSchool.dto.dailychallenge.DailyChallengeResponse;
import com.app.umkaSchool.service.DailyChallengeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/daily-challenges")
public class DailyChallengeController {

    private final DailyChallengeService dailyChallengeService;

    @Autowired
    public DailyChallengeController(DailyChallengeService dailyChallengeService) {
        this.dailyChallengeService = dailyChallengeService;
    }

    @PostMapping
    public ResponseEntity<DailyChallengeResponse> createDailyChallenge(
            @Valid @RequestBody CreateDailyChallengeRequest request) {
        DailyChallengeResponse response = dailyChallengeService.createDailyChallenge(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/today")
    public ResponseEntity<DailyChallengeResponse> getTodayChallenge() {
        DailyChallengeResponse response = dailyChallengeService.getTodayChallenge();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/date/{date}")
    public ResponseEntity<DailyChallengeResponse> getDailyChallengeByDate(@PathVariable LocalDate date) {
        DailyChallengeResponse response = dailyChallengeService.getDailyChallengeByDate(date);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{challengeId}")
    public ResponseEntity<DailyChallengeResponse> getDailyChallengeById(@PathVariable UUID challengeId) {
        DailyChallengeResponse response = dailyChallengeService.getDailyChallengeById(challengeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<DailyChallengeResponse>> getAllDailyChallenges() {
        List<DailyChallengeResponse> challenges = dailyChallengeService.getAllDailyChallenges();
        return ResponseEntity.ok(challenges);
    }

    @DeleteMapping("/{challengeId}")
    public ResponseEntity<Void> deleteDailyChallenge(@PathVariable UUID challengeId) {
        dailyChallengeService.deleteDailyChallenge(challengeId);
        return ResponseEntity.noContent().build();
    }
}

