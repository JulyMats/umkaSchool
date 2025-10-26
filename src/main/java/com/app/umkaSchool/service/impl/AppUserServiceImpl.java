package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.AppUserDto;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.enums.ThemeMode;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.service.AppUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AppUserServiceImpl implements AppUserService {
    
    private final AppUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AppUserDto> findAll() {
        return userRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AppUserDto> findById(UUID id) {
        return userRepository.findById(id)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AppUser> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public AppUserDto save(AppUserDto userDto) {
        AppUser user = userRepository.findById(userDto.id())
                .orElseGet(() -> {
                    AppUser newUser = new AppUser();
                    newUser.setId(userDto.id() != null ? userDto.id() : UUID.randomUUID());
                    return newUser;
                });
        
        updateUserFromDto(user, userDto);
        return mapToDto(userRepository.save(user));
    }

    @Override
    public void deleteById(UUID id) {
        userRepository.deleteById(id);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    @Override
    public void updateLastLoginTime(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastLoginAt(ZonedDateTime.now());
            userRepository.save(user);
        });
    }

    @Override
    public void updateThemeMode(UUID id, String themeMode) {
        userRepository.findById(id).ifPresent(user -> {
            user.setAppTheme(ThemeMode.valueOf(themeMode.toUpperCase()));
            userRepository.save(user);
        });
    }

    @Override
    public void updateLanguage(UUID id, String language) {
        userRepository.findById(id).ifPresent(user -> {
            user.setAppLanguage(language.toUpperCase());
            userRepository.save(user);
        });
    }

    @Override
    public void updateAvatar(UUID id, String avatarUrl) {
        userRepository.findById(id).ifPresent(user -> {
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
        });
    }

    @Override
    public void updatePassword(AppUser user, String newPassword) {
        user.setPasswordHash(newPassword);
        userRepository.save(user);
    }

    @Override
    public void deactivateUser(UUID id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setActive(false);
            userRepository.save(user);
        });
    }

    @Override
    public void activateUser(UUID id) {
        userRepository.findById(id).ifPresent(user -> {
            user.setActive(true);
            userRepository.save(user);
        });
    }

    private AppUserDto mapToDto(AppUser user) {
        return new AppUserDto(
            user.getId(),
            user.getFirstName(),
            user.getLastName(),
            user.getEmail(),
            user.getUserRole(),
            user.getAppLanguage(),
            user.getAvatarUrl(),
            user.getActive(),
            user.getAppTheme(),
            user.getLastLoginAt(),
            user.getCreatedAt(),
            user.getUpdatedAt()
        );
    }

    private void updateUserFromDto(AppUser user, AppUserDto dto) {
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setEmail(dto.email());
        user.setUserRole(dto.userRole());
        user.setAppLanguage(dto.appLanguage());
        user.setAvatarUrl(dto.avatarUrl());
        user.setActive(dto.isActive());
        user.setAppTheme(dto.appTheme());
    }
}