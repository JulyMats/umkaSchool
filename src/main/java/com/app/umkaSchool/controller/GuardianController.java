package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.GuardianDto;
import com.app.umkaSchool.service.GuardianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/guardians")
@RequiredArgsConstructor
public class GuardianController {
    
    private final GuardianService guardianService;

    @GetMapping
    public ResponseEntity<List<GuardianDto>> getAllGuardians() {
        return ResponseEntity.ok(guardianService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuardianDto> getGuardianById(@PathVariable UUID id) {
        return guardianService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<GuardianDto> getGuardianByEmail(@PathVariable String email) {
        return guardianService.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<GuardianDto> createGuardian(@RequestBody GuardianDto guardianDto) {
        return ResponseEntity.ok(guardianService.save(guardianDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GuardianDto> updateGuardian(
            @PathVariable UUID id,
            @RequestBody GuardianDto guardianDto) {
        if (!id.equals(guardianDto.id())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(guardianService.save(guardianDto));
    }

    @PutMapping("/{id}/phone")
    public ResponseEntity<Void> updatePhone(
            @PathVariable UUID id,
            @RequestParam String phone) {
        guardianService.updatePhone(id, phone);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/relationship")
    public ResponseEntity<Void> updateRelationship(
            @PathVariable UUID id,
            @RequestParam String relationship) {
        guardianService.updateRelationship(id, relationship);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGuardian(@PathVariable UUID id) {
        guardianService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}