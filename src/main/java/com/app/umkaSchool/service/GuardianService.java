package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.GuardianDto;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GuardianService {
    List<GuardianDto> findAll();
    Optional<GuardianDto> findById(UUID id);
    Optional<GuardianDto> findByEmail(String email);
    GuardianDto save(GuardianDto guardianDto);
    void deleteById(UUID id);
    void updatePhone(UUID id, String phone);
    void updateRelationship(UUID id, String relationship);
}