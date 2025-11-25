package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.dto.student.StudentResponse;
import com.app.umkaSchool.dto.student.UpdateStudentRequest;
import com.app.umkaSchool.model.Student;

import java.util.List;
import java.util.UUID;

public interface StudentService {
    StudentResponse createStudent(CreateStudentRequest request);

    StudentResponse updateStudent(UUID studentId, UpdateStudentRequest request);

    StudentResponse getStudentById(UUID studentId);

    StudentResponse getStudentByUserId(UUID userId);

    List<StudentResponse> getAllStudents();

    List<StudentResponse> getStudentsByTeacher(UUID teacherId);

    List<StudentResponse> getStudentsByGroup(UUID groupId);

    void deleteStudent(UUID studentId);

    void assignToTeacher(UUID studentId, UUID teacherId);

    void assignToGroup(UUID studentId, UUID groupId);

    void updateLastActivity(UUID studentId);

    Student getStudentEntity(UUID studentId);
}

