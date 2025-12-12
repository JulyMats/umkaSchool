package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.dailychallenge.CreateDailyChallengeRequest;
import com.app.umkaSchool.dto.dailychallenge.DailyChallengeResponse;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.*;
import com.app.umkaSchool.repository.DailyChallengeRepository;
import com.app.umkaSchool.repository.ExerciseRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.DailyChallengeService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class DailyChallengeServiceImpl implements DailyChallengeService {
    private static final Logger logger = LoggerFactory.getLogger(DailyChallengeServiceImpl.class);

    private final DailyChallengeRepository dailyChallengeRepository;
    private final ExerciseRepository exerciseRepository;
    private final TeacherRepository teacherRepository;

    @Autowired
    public DailyChallengeServiceImpl(DailyChallengeRepository dailyChallengeRepository,
                                     ExerciseRepository exerciseRepository,
                                     TeacherRepository teacherRepository) {
        this.dailyChallengeRepository = dailyChallengeRepository;
        this.exerciseRepository = exerciseRepository;
        this.teacherRepository = teacherRepository;
    }

    @Override
    @Transactional
    public DailyChallengeResponse createDailyChallenge(CreateDailyChallengeRequest request) {
        logger.info("Creating daily challenge for date: {}", request.getChallengeDate());

        if (dailyChallengeRepository.existsByChallengeDate(request.getChallengeDate())) {
            throw new IllegalArgumentException("Daily challenge for this date already exists");
        }

        DailyChallenge dailyChallenge = new DailyChallenge();
        dailyChallenge.setChallengeDate(request.getChallengeDate());
        dailyChallenge.setTitle(request.getTitle());
        dailyChallenge.setDescription(request.getDescription());

        if (request.getCreatedById() != null) {
            Teacher teacher = teacherRepository.findById(request.getCreatedById())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found with id: " + request.getCreatedById()));
            dailyChallenge.setCreatedBy(teacher);
        }

        DailyChallenge savedChallenge = dailyChallengeRepository.save(dailyChallenge);

        Set<DailyChallengeExercise> challengeExercises = new HashSet<>();
        for (CreateDailyChallengeRequest.ExerciseRequest exerciseRequest : request.getExercises()) {
            Exercise exercise = exerciseRepository.findById(exerciseRequest.getExerciseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Exercise not found with id: " + exerciseRequest.getExerciseId()));

            DailyChallengeExercise challengeExercise = new DailyChallengeExercise();
            DailyChallengeExerciseId id = new DailyChallengeExerciseId();
            id.setDailyChallengeId(savedChallenge.getId());
            id.setExerciseId(exercise.getId());
            challengeExercise.setId(id);
            challengeExercise.setDailyChallenge(savedChallenge);
            challengeExercise.setExercise(exercise);
            challengeExercise.setOrderIndex(exerciseRequest.getOrderIndex() != null ? exerciseRequest.getOrderIndex() : 0);
            challengeExercises.add(challengeExercise);
        }

        savedChallenge.setExercises(challengeExercises);
        savedChallenge = dailyChallengeRepository.save(savedChallenge);

        return mapToResponse(savedChallenge);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyChallengeResponse getDailyChallengeById(UUID challengeId) {
        DailyChallenge challenge = dailyChallengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Daily challenge not found with id: " + challengeId));
        return mapToResponse(challenge);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyChallengeResponse getDailyChallengeByDate(LocalDate date) {
        DailyChallenge challenge = dailyChallengeRepository.findByChallengeDate(date)
                .orElseThrow(() -> new ResourceNotFoundException("Daily challenge not found for date: " + date));
        return mapToResponse(challenge);
    }

    @Override
    @Transactional(readOnly = true)
    public DailyChallengeResponse getTodayChallenge() {
        LocalDate today = LocalDate.now();
        Optional<DailyChallenge> todayChallenge = dailyChallengeRepository.findByChallengeDate(today);
        
        if (todayChallenge.isPresent()) {
            logger.info("Found daily challenge for today: {}", today);
            return mapToResponse(todayChallenge.get());
        }
        
        // If no challenge for today, get the most recent one
        Optional<DailyChallenge> latestChallenge = dailyChallengeRepository.findFirstByOrderByChallengeDateDesc();
        if (latestChallenge.isPresent()) {
            logger.info("No challenge found for today ({}), returning latest challenge from: {}", 
                    today, latestChallenge.get().getChallengeDate());
            return mapToResponse(latestChallenge.get());
        }
        
        throw new ResourceNotFoundException("No daily challenge found for today: " + today + " and no previous challenges available");
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyChallengeResponse> getAllDailyChallenges() {
        return dailyChallengeRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteDailyChallenge(UUID challengeId) {
        if (!dailyChallengeRepository.existsById(challengeId)) {
            throw new ResourceNotFoundException("Daily challenge not found with id: " + challengeId);
        }
        dailyChallengeRepository.deleteById(challengeId);
        logger.info("Deleted daily challenge with id: {}", challengeId);
    }

    private DailyChallengeResponse mapToResponse(DailyChallenge challenge) {
        List<DailyChallengeResponse.ExerciseInfo> exercises = challenge.getExercises().stream()
                .sorted((e1, e2) -> Integer.compare(
                        e1.getOrderIndex() != null ? e1.getOrderIndex() : 0,
                        e2.getOrderIndex() != null ? e2.getOrderIndex() : 0
                ))
                .map(ce -> {
                    Exercise exercise = ce.getExercise();
                    return DailyChallengeResponse.ExerciseInfo.builder()
                            .exerciseId(exercise.getId())
                            .exerciseTypeId(exercise.getExerciseType().getId())
                            .exerciseTypeName(exercise.getExerciseType().getName())
                            .parameters(exercise.getParameters())
                            .difficulty(exercise.getDifficulty())
                            .points(exercise.getPoints())
                            .orderIndex(ce.getOrderIndex())
                            .build();
                })
                .collect(Collectors.toList());

        return DailyChallengeResponse.builder()
                .id(challenge.getId())
                .challengeDate(challenge.getChallengeDate())
                .title(challenge.getTitle())
                .description(challenge.getDescription())
                .createdById(challenge.getCreatedBy() != null ? challenge.getCreatedBy().getId() : null)
                .createdByName(challenge.getCreatedBy() != null ? 
                        challenge.getCreatedBy().getUser().getFirstName() + " " + 
                        challenge.getCreatedBy().getUser().getLastName() : null)
                .createdAt(challenge.getCreatedAt())
                .updatedAt(challenge.getUpdatedAt())
                .exercises(exercises)
                .build();
    }
}