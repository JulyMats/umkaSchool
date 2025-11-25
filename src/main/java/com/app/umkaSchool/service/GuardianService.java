package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.guardian.CreateGuardianRequest;
import com.app.umkaSchool.dto.guardian.GuardianResponse;
import com.app.umkaSchool.dto.guardian.UpdateGuardianRequest;
import com.app.umkaSchool.model.Guardian;

import java.util.List;
import java.util.UUID;

public interface GuardianService {
    GuardianResponse createGuardian(CreateGuardianRequest request);

    GuardianResponse updateGuardian(UUID guardianId, UpdateGuardianRequest request);

    GuardianResponse getGuardianById(UUID guardianId);

    GuardianResponse getGuardianByEmail(String email);

    List<GuardianResponse> getAllGuardians();

    void deleteGuardian(UUID guardianId);

    Guardian getGuardianEntity(UUID guardianId);
}
