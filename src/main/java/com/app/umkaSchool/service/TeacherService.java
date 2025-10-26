package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.TeacherDto;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TeacherService {
    List<TeacherDto> findAll();
    Optional<TeacherDto> findById(UUID id);
    TeacherDto save(TeacherDto teacherDto);
    void deleteById(UUID id);
    void updateBio(UUID id, String bio);
    void updatePhone(UUID id, String phone);
    Optional<TeacherDto> findByUserId(UUID userId);
}