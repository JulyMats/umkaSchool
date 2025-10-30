package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.guardian.CreateGuardianRequest;
import com.app.umkaSchool.dto.guardian.GuardianResponse;
import com.app.umkaSchool.dto.guardian.UpdateGuardianRequest;
import com.app.umkaSchool.service.GuardianService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/guardians")
public class GuardianController {

    private final GuardianService guardianService;

    @Autowired
    public GuardianController(GuardianService guardianService) {
        this.guardianService = guardianService;
    }

    @PostMapping
    public ResponseEntity<GuardianResponse> createGuardian(@Valid @RequestBody CreateGuardianRequest request) {
        GuardianResponse response = guardianService.createGuardian(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{guardianId}")
    public ResponseEntity<GuardianResponse> updateGuardian(
            @PathVariable UUID guardianId,
            @Valid @RequestBody UpdateGuardianRequest request) {
        GuardianResponse response = guardianService.updateGuardian(guardianId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{guardianId}")
    public ResponseEntity<GuardianResponse> getGuardianById(@PathVariable UUID guardianId) {
        GuardianResponse response = guardianService.getGuardianById(guardianId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<GuardianResponse> getGuardianByEmail(@PathVariable String email) {
        GuardianResponse response = guardianService.getGuardianByEmail(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<GuardianResponse>> getAllGuardians() {
        List<GuardianResponse> guardians = guardianService.getAllGuardians();
        return ResponseEntity.ok(guardians);
    }

    @DeleteMapping("/{guardianId}")
    public ResponseEntity<Void> deleteGuardian(@PathVariable UUID guardianId) {
        guardianService.deleteGuardian(guardianId);
        return ResponseEntity.noContent().build();
    }
}

