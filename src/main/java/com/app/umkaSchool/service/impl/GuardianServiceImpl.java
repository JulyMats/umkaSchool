package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.GuardianDto;
import com.app.umkaSchool.model.Guardian;
import com.app.umkaSchool.model.enums.GuardianRelationship;
import com.app.umkaSchool.repository.GuardianRepository;
import com.app.umkaSchool.service.GuardianService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class GuardianServiceImpl implements GuardianService {
    
    private final GuardianRepository guardianRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GuardianDto> findAll() {
        return guardianRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GuardianDto> findById(UUID id) {
        return guardianRepository.findById(id)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<GuardianDto> findByEmail(String email) {
        return guardianRepository.findAll().stream()
                .filter(guardian -> guardian.getEmail().equals(email))
                .findFirst()
                .map(this::mapToDto);
    }

    @Override
    public GuardianDto save(GuardianDto guardianDto) {
        Guardian guardian = guardianRepository.findById(guardianDto.id())
                .orElseGet(() -> {
                    Guardian newGuardian = new Guardian();
                    newGuardian.setId(UUID.randomUUID());
                    return newGuardian;
                });

        updateGuardianFromDto(guardian, guardianDto);
        return mapToDto(guardianRepository.save(guardian));
    }

    @Override
    public void deleteById(UUID id) {
        guardianRepository.deleteById(id);
    }

    @Override
    public void updatePhone(UUID id, String phone) {
        guardianRepository.findById(id).ifPresent(guardian -> {
            guardian.setPhone(phone);
            guardianRepository.save(guardian);
        });
    }

    @Override
    public void updateRelationship(UUID id, String relationship) {
        guardianRepository.findById(id).ifPresent(guardian -> {
            guardian.setRelationship(GuardianRelationship.valueOf(relationship.toUpperCase()));
            guardianRepository.save(guardian);
        });
    }

    private GuardianDto mapToDto(Guardian guardian) {
        return new GuardianDto(
            guardian.getId(),
            guardian.getFirstName(),
            guardian.getLastName(),
            guardian.getEmail(),
            guardian.getPhone(),
            guardian.getRelationship()
        );
    }

    private void updateGuardianFromDto(Guardian guardian, GuardianDto dto) {
        guardian.setFirstName(dto.firstName());
        guardian.setLastName(dto.lastName());
        guardian.setEmail(dto.email());
        guardian.setPhone(dto.phone());
        guardian.setRelationship(dto.relationship());
    }
}