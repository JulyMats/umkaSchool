package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.TeacherDto;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.AppUserRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.TeacherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class TeacherServiceImpl implements TeacherService {
    
    private final TeacherRepository teacherRepository;
    private final AppUserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TeacherDto> findAll() {
        return teacherRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TeacherDto> findById(UUID id) {
        return teacherRepository.findById(id)
                .map(this::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TeacherDto> findByUserId(UUID userId) {
        return teacherRepository.findAll().stream()
                .filter(teacher -> teacher.getUser().getId().equals(userId))
                .findFirst()
                .map(this::mapToDto);
    }

    @Override
    public TeacherDto save(TeacherDto teacherDto) {
        var user = userRepository.findById(teacherDto.userId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Teacher teacher = teacherRepository.findById(teacherDto.id())
                .orElseGet(() -> {
                    Teacher newTeacher = new Teacher();
                    newTeacher.setId(UUID.randomUUID());
                    return newTeacher;
                });

        teacher.setUser(user);
        teacher.setBio(teacherDto.bio());
        teacher.setPhone(teacherDto.phone());

        return mapToDto(teacherRepository.save(teacher));
    }

    @Override
    public void deleteById(UUID id) {
        teacherRepository.deleteById(id);
    }

    @Override
    public void updateBio(UUID id, String bio) {
        teacherRepository.findById(id).ifPresent(teacher -> {
            teacher.setBio(bio);
            teacherRepository.save(teacher);
        });
    }

    @Override
    public void updatePhone(UUID id, String phone) {
        teacherRepository.findById(id).ifPresent(teacher -> {
            teacher.setPhone(phone);
            teacherRepository.save(teacher);
        });
    }

    private TeacherDto mapToDto(Teacher teacher) {
        return new TeacherDto(
            teacher.getId(),
            teacher.getUser().getId(),
            teacher.getUser().getFirstName(),
            teacher.getUser().getLastName(),
            teacher.getUser().getEmail(),
            teacher.getPhone(),
            teacher.getBio(),
            teacher.getUser().getAvatarUrl(),
            teacher.getUser().getActive()
        );
    }
}