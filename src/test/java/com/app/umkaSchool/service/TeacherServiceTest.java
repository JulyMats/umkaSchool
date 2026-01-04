package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.dto.teacher.TeacherResponse;
import com.app.umkaSchool.dto.teacher.UpdateTeacherRequest;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.impl.TeacherServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private com.app.umkaSchool.repository.StudentRepository studentRepository;

    @Mock
    private com.app.umkaSchool.repository.StudentGroupRepository groupRepository;

    @InjectMocks
    private TeacherServiceImpl teacherService;

    private AppUser testUser;
    private Teacher testTeacher;
    private UUID teacherId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        teacherId = UUID.randomUUID();

        testUser = new AppUser();
        testUser.setId(userId);
        testUser.setEmail("teacher@example.com");
        testUser.setFirstName("Teacher");
        testUser.setLastName("Test");
        testUser.setUserRole(AppUser.UserRole.TEACHER);
        testUser.setActive(true);

        testTeacher = new Teacher();
        testTeacher.setId(teacherId);
        testTeacher.setUser(testUser);
        testTeacher.setPhone("123456789");
        testTeacher.setBio("Test bio");
    }

    @Test
    void getAllTeachers_ShouldReturnList() {
        when(teacherRepository.findAll()).thenReturn(List.of(testTeacher));
        when(studentRepository.findByTeacher_Id(any(UUID.class))).thenReturn(List.of());
        when(groupRepository.findByTeacher_Id(any(UUID.class))).thenReturn(List.of());

        List<TeacherResponse> result = teacherService.getAllTeachers();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(teacherRepository).findAll();
    }

    @Test
    void getTeacherById_ShouldReturnTeacher() {
        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(testTeacher));
        when(studentRepository.findByTeacher_Id(teacherId)).thenReturn(List.of());
        when(groupRepository.findByTeacher_Id(teacherId)).thenReturn(List.of());

        TeacherResponse result = teacherService.getTeacherById(teacherId);

        assertNotNull(result);
        assertEquals(teacherId, result.getId());
        verify(teacherRepository).findById(teacherId);
    }

    @Test
    void getTeacherById_WhenNotFound_ShouldThrowException() {
        when(teacherRepository.findById(teacherId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            teacherService.getTeacherById(teacherId);
        });
    }

    @Test
    void updateTeacher_ShouldUpdateTeacher() {
        UpdateTeacherRequest request = new UpdateTeacherRequest();
        request.setFirstName("Updated");
        request.setLastName("Name");
        request.setEmail("updated@example.com");
        request.setPhone("987654321");
        request.setBio("Updated bio");

        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(testTeacher));
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.save(any(AppUser.class))).thenReturn(testUser);
        when(teacherRepository.save(any(Teacher.class))).thenReturn(testTeacher);
        when(studentRepository.findByTeacher_Id(teacherId)).thenReturn(List.of());
        when(groupRepository.findByTeacher_Id(teacherId)).thenReturn(List.of());

        TeacherResponse result = teacherService.updateTeacher(teacherId, request);

        assertNotNull(result);
        verify(teacherRepository).save(testTeacher);
        verify(userRepository).save(testUser);
    }

    @Test
    void deleteTeacher_ShouldDeleteTeacher() {
        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(testTeacher));
        doNothing().when(teacherRepository).delete(testTeacher);

        teacherService.deleteTeacher(teacherId);

        verify(teacherRepository).delete(testTeacher);
    }
}

