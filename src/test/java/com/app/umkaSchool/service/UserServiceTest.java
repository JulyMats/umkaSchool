package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.auth.RegisterRequest;
import com.app.umkaSchool.dto.user.UpdateUserRequest;
import com.app.umkaSchool.dto.user.UserResponse;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.service.impl.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class UserServiceTest {

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private AppUser testUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = new AppUser();
        testUser.setId(userId);
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setUserRole(AppUser.UserRole.STUDENT);
        testUser.setActive(true);
    }

    @Test
    void findByEmail_ShouldReturnUser() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Optional<AppUser> result = userService.findByEmail("test@example.com");

        assertTrue(result.isPresent());
        assertEquals("test@example.com", result.get().getEmail());
        verify(userRepository).findByEmail("test@example.com");
    }

    @Test
    void findByEmail_WhenUserNotFound_ShouldReturnEmpty() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        Optional<AppUser> result = userService.findByEmail("notfound@example.com");

        assertFalse(result.isPresent());
    }

    @Test
    void findById_ShouldReturnUser() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        Optional<AppUser> result = userService.findById(userId);

        assertTrue(result.isPresent());
        assertEquals(userId, result.get().getId());
    }

    @Test
    void createUser_ShouldCreateAndSaveUser() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("new@example.com");
        request.setFirstName("New");
        request.setLastName("User");
        request.setPassword("password123");
        request.setRole("STUDENT");

        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser user = invocation.getArgument(0);
            user.setId(UUID.randomUUID());
            return user;
        });

        AppUser result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("new@example.com", result.getEmail());
        assertEquals("New", result.getFirstName());
        assertEquals("New", result.getFirstName());
        assertEquals(AppUser.UserRole.STUDENT, result.getUserRole());
        assertTrue(result.isActive());
        verify(userRepository).save(any(AppUser.class));
        verify(passwordEncoder).encode("password123");
    }

    @Test
    void updatePassword_ShouldUpdatePassword() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(AppUser.class))).thenReturn(testUser);

        userService.updatePassword(userId, "newPassword");

        verify(userRepository).findById(userId);
        verify(passwordEncoder).encode("newPassword");
        verify(userRepository).save(testUser);
    }

    @Test
    void updatePassword_WhenUserNotFound_ShouldThrowException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.updatePassword(userId, "newPassword");
        });
    }

    @Test
    void getUserById_ShouldReturnUserResponse() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        UserResponse result = userService.getUserById(userId);

        assertNotNull(result);
        assertEquals(userId, result.getId());
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void getUserById_WhenUserNotFound_ShouldThrowException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getUserById(userId);
        });
    }

    @Test
    void getUserByEmail_ShouldReturnUserResponse() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        UserResponse result = userService.getUserByEmail("test@example.com");

        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void updateUser_ShouldUpdateUser() {
        UpdateUserRequest request = new UpdateUserRequest();
        request.setFirstName("Updated");
        request.setLastName("Name");
        request.setEmail("updated@example.com");

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(AppUser.class))).thenReturn(testUser);

        UserResponse result = userService.updateUser(userId, request);

        assertNotNull(result);
        verify(userRepository).save(testUser);
    }

    @Test
    void deleteUser_ShouldDeleteUser() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        userService.deleteUser(userId);

        verify(userRepository).delete(testUser);
    }

    @Test
    void activateUser_ShouldActivateUser() {
        testUser.setActive(false);
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(AppUser.class))).thenReturn(testUser);

        userService.activateUser(userId);

        assertTrue(testUser.isActive());
        verify(userRepository).save(testUser);
    }

    @Test
    void deactivateUser_ShouldDeactivateUser() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(AppUser.class))).thenReturn(testUser);

        userService.deactivateUser(userId);

        assertFalse(testUser.isActive());
        verify(userRepository).save(testUser);
    }
}


