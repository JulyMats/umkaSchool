package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final AppUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(AppUserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public Optional<AppUser> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public AppUser createUser(RegisterRequest request) {
        AppUser user = new AppUser();
        user.setUserRole(AppUser.UserRole.valueOf(request.getRole().toUpperCase()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        String encoded = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(encoded);
        user.setAvatarUrl("/static/default-avatar.png");
        user.setActive(true);
        // let DB generate id and timestamps
        return userRepository.save(user);
    }

    @Override
    public void updatePassword(AppUser user, String newPassword) {
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
