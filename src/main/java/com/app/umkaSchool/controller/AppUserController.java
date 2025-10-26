package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.AppUserDto;
import com.app.umkaSchool.service.AppUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AppUserController {
    
    private final AppUserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AppUserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")
    public ResponseEntity<AppUserDto> getUserById(@PathVariable UUID id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @userSecurity.isCurrentUser(#id)")
    public ResponseEntity<AppUserDto> updateUser(@PathVariable UUID id, @RequestBody AppUserDto userDto) {
        if (!id.equals(userDto.id())) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(userService.save(userDto));
    }

    @PutMapping("/{id}/theme")
    @PreAuthorize("@userSecurity.isCurrentUser(#id)")
    public ResponseEntity<Void> updateTheme(@PathVariable UUID id, @RequestParam String theme) {
        userService.updateThemeMode(id, theme);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/language")
    @PreAuthorize("@userSecurity.isCurrentUser(#id)")
    public ResponseEntity<Void> updateLanguage(@PathVariable UUID id, @RequestParam String language) {
        userService.updateLanguage(id, language);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/avatar")
    @PreAuthorize("@userSecurity.isCurrentUser(#id)")
    public ResponseEntity<Void> updateAvatar(@PathVariable UUID id, @RequestParam String avatarUrl) {
        userService.updateAvatar(id, avatarUrl);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable UUID id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateUser(@PathVariable UUID id) {
        userService.activateUser(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}