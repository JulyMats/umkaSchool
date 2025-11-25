package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.teacher.CreateTeacherRequest;
import com.app.umkaSchool.dto.teacher.TeacherResponse;
import com.app.umkaSchool.dto.teacher.UpdateTeacherRequest;
import com.app.umkaSchool.model.Teacher;

import java.util.List;
import java.util.UUID;

public interface TeacherService {
    TeacherResponse createTeacher(CreateTeacherRequest request);

    TeacherResponse updateTeacher(UUID teacherId, UpdateTeacherRequest request);

    TeacherResponse getTeacherById(UUID teacherId);

    TeacherResponse getTeacherByUserId(UUID userId);

    List<TeacherResponse> getAllTeachers();

    void deleteTeacher(UUID teacherId);

    Teacher getTeacherEntity(UUID teacherId);
}