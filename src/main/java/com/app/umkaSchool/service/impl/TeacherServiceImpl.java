package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.dto.teacher.TeacherResponse;
import com.app.umkaSchool.dto.teacher.UpdateTeacherRequest;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.StudentGroupRepository;
import com.app.umkaSchool.repository.StudentRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.TeacherService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TeacherServiceImpl implements TeacherService {
    private static final Logger logger = LoggerFactory.getLogger(TeacherServiceImpl.class);

    private final TeacherRepository teacherRepository;
    private final AppUserRepository userRepository;
    private final StudentRepository studentRepository;
    private final StudentGroupRepository groupRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public TeacherServiceImpl(TeacherRepository teacherRepository,
                              AppUserRepository userRepository,
                              StudentRepository studentRepository,
                              StudentGroupRepository groupRepository,
                              PasswordEncoder passwordEncoder) {
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.groupRepository = groupRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public TeacherResponse createTeacher(CreateTeacherRequest request) {
        logger.info("Creating new teacher: {}", request.getEmail());

        // Find existing user by email
        AppUser user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User with email " + request.getEmail() + " not found. User must be created first via signup."));

        // Check if teacher already exists for this user
        if (teacherRepository.findByUser_Id(user.getId()).isPresent()) {
            throw new IllegalArgumentException("Teacher profile already exists for this user");
        }

        // Update user information
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Update avatar URL if provided
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        user = userRepository.save(user);

        // Create teacher
        Teacher teacher = new Teacher();
        teacher.setId(user.getId());
        teacher.setUser(user);
        teacher.setBio(request.getBio());
        teacher.setPhone(request.getPhone());
        teacher = teacherRepository.save(teacher);

        logger.info("Teacher created successfully: {}", teacher.getId());
        return mapToResponse(teacher);
    }

    @Override
    @Transactional
    public TeacherResponse updateTeacher(UUID teacherId, UpdateTeacherRequest request) {
        logger.info("Updating teacher: {}", teacherId);

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        AppUser user = teacher.getUser();

        // Update user info
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already in use");
            }
            user.setEmail(request.getEmail());
        }

        // Update teacher info
        if (request.getBio() != null) {
            teacher.setBio(request.getBio());
        }
        if (request.getPhone() != null) {
            teacher.setPhone(request.getPhone());
        }

        userRepository.save(user);
        teacher = teacherRepository.save(teacher);

        logger.info("Teacher updated successfully: {}", teacherId);
        return mapToResponse(teacher);
    }

    @Override
    public TeacherResponse getTeacherById(UUID teacherId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
        return mapToResponse(teacher);
    }

    @Override
    public TeacherResponse getTeacherByUserId(UUID userId) {
        Teacher teacher = teacherRepository.findByUser_Id(userId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found for user"));
        return mapToResponse(teacher);
    }

    @Override
    public List<TeacherResponse> getAllTeachers() {
        return teacherRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteTeacher(UUID teacherId) {
        logger.info("Deleting teacher: {}", teacherId);
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        AppUser user = teacher.getUser();
        teacherRepository.delete(teacher);
        userRepository.delete(user);

        logger.info("Teacher deleted successfully: {}", teacherId);
    }

    @Override
    public Teacher getTeacherEntity(UUID teacherId) {
        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
    }

    private TeacherResponse mapToResponse(Teacher teacher) {
        AppUser user = teacher.getUser();

        int totalStudents = studentRepository.findByTeacher_Id(teacher.getId()).size();
        int totalGroups = groupRepository.findByTeacher_Id(teacher.getId()).size();

        return TeacherResponse.builder()
                .id(teacher.getId())
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .bio(teacher.getBio())
                .phone(teacher.getPhone())
                .totalStudents(totalStudents)
                .totalGroups(totalGroups)
                .createdAt(user.getCreatedAt())
                .avatarUrl(user.getAvatarUrl())
                .build();
    }
}