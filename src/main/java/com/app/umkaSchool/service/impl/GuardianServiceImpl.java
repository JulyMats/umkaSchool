package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.guardian.CreateGuardianRequest;
import com.app.umkaSchool.dto.guardian.GuardianResponse;
import com.app.umkaSchool.dto.guardian.UpdateGuardianRequest;
import com.app.umkaSchool.model.Guardian;
import com.app.umkaSchool.model.enums.GuardianRelationship;
import com.app.umkaSchool.repository.GuardianRepository;
import com.app.umkaSchool.service.GuardianService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GuardianServiceImpl implements GuardianService {
    private static final Logger logger = LoggerFactory.getLogger(GuardianServiceImpl.class);

    private final GuardianRepository guardianRepository;

    @Autowired
    public GuardianServiceImpl(GuardianRepository guardianRepository) {
        this.guardianRepository = guardianRepository;
    }

    @Override
    @Transactional
    public GuardianResponse createGuardian(CreateGuardianRequest request) {
        logger.info("Creating new guardian: {}", request.getEmail());

        if (guardianRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        Guardian guardian = new Guardian();
        guardian.setFirstName(request.getFirstName());
        guardian.setLastName(request.getLastName());
        guardian.setEmail(request.getEmail());
        guardian.setPhone(request.getPhone());
        guardian.setRelationship(GuardianRelationship.valueOf(request.getRelationship()));

        guardian = guardianRepository.save(guardian);
        logger.info("Guardian created successfully: {}", guardian.getId());

        return mapToResponse(guardian);
    }

    @Override
    @Transactional
    public GuardianResponse updateGuardian(UUID guardianId, UpdateGuardianRequest request) {
        logger.info("Updating guardian: {}", guardianId);

        Guardian guardian = guardianRepository.findById(guardianId)
                .orElseThrow(() -> new IllegalArgumentException("Guardian not found"));

        if (request.getFirstName() != null) {
            guardian.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            guardian.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(guardian.getEmail())) {
            if (guardianRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            guardian.setEmail(request.getEmail());
        }
        if (request.getPhone() != null) {
            guardian.setPhone(request.getPhone());
        }
        if (request.getRelationship() != null) {
            guardian.setRelationship(GuardianRelationship.valueOf(request.getRelationship()));
        }

        guardian = guardianRepository.save(guardian);
        logger.info("Guardian updated successfully: {}", guardianId);

        return mapToResponse(guardian);
    }

    @Override
    public GuardianResponse getGuardianById(UUID guardianId) {
        Guardian guardian = guardianRepository.findById(guardianId)
                .orElseThrow(() -> new IllegalArgumentException("Guardian not found"));
        return mapToResponse(guardian);
    }

    @Override
    public GuardianResponse getGuardianByEmail(String email) {
        Guardian guardian = guardianRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Guardian not found"));
        return mapToResponse(guardian);
    }

    @Override
    public List<GuardianResponse> getAllGuardians() {
        return guardianRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteGuardian(UUID guardianId) {
        logger.info("Deleting guardian: {}", guardianId);

        Guardian guardian = guardianRepository.findById(guardianId)
                .orElseThrow(() -> new IllegalArgumentException("Guardian not found"));

        guardianRepository.delete(guardian);
        logger.info("Guardian deleted successfully: {}", guardianId);
    }

    @Override
    public Guardian getGuardianEntity(UUID guardianId) {
        return guardianRepository.findById(guardianId)
                .orElseThrow(() -> new IllegalArgumentException("Guardian not found"));
    }

    private GuardianResponse mapToResponse(Guardian guardian) {
        return GuardianResponse.builder()
                .id(guardian.getId())
                .firstName(guardian.getFirstName())
                .lastName(guardian.getLastName())
                .email(guardian.getEmail())
                .phone(guardian.getPhone())
                .relationship(guardian.getRelationship().name())
                .build();
    }
}

