package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.student.CreateStudentRequest;
import com.app.umkaSchool.dto.student.StudentResponse;
import com.app.umkaSchool.dto.student.UpdateStudentRequest;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.*;
import com.app.umkaSchool.model.enums.GuardianRelationship;
import com.app.umkaSchool.repository.*;
import com.app.umkaSchool.service.impl.StudentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private AppUserRepository userRepository;

    @Mock
    private GuardianRepository guardianRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private StudentGroupRepository groupRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    private AppUser testUser;
    private Student testStudent;
    private Guardian testGuardian;
    private UUID studentId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        studentId = UUID.randomUUID();

        testUser = new AppUser();
        testUser.setId(userId);
        testUser.setEmail("student@example.com");
        testUser.setFirstName("Student");
        testUser.setLastName("Test");
        testUser.setUserRole(AppUser.UserRole.STUDENT);
        testUser.setActive(true);

        testGuardian = new Guardian();
        testGuardian.setId(UUID.randomUUID());
        testGuardian.setFirstName("Guardian");
        testGuardian.setLastName("Name");
        testGuardian.setEmail("guardian@example.com");
        testGuardian.setPhone("123456789");
        testGuardian.setRelationship(GuardianRelationship.MOTHER);

        testStudent = new Student();
        testStudent.setId(studentId);
        testStudent.setUser(testUser);
        testStudent.setGuardian(testGuardian);
        testStudent.setDateOfBirth(LocalDate.of(2010, 1, 1));
    }

    @Test
    void getAllStudents_ShouldReturnList() {
        when(studentRepository.findAll()).thenReturn(List.of(testStudent));

        List<StudentResponse> result = studentService.getAllStudents();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(studentRepository).findAll();
    }

    @Test
    void getStudentById_ShouldReturnStudent() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));

        StudentResponse result = studentService.getStudentById(studentId);

        assertNotNull(result);
        assertEquals(studentId, result.getId());
        verify(studentRepository).findById(studentId);
    }

    @Test
    void getStudentById_WhenNotFound_ShouldThrowException() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            studentService.getStudentById(studentId);
        });
    }

    @Test
    void updateStudent_ShouldUpdateStudent() {
        UpdateStudentRequest request = new UpdateStudentRequest();
        request.setFirstName("Updated");
        request.setLastName("Name");
        request.setEmail("updated@example.com");
        request.setDateOfBirth(LocalDate.of(2011, 2, 2));

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(userRepository.save(any(AppUser.class))).thenReturn(testUser);
        when(studentRepository.save(any(Student.class))).thenReturn(testStudent);

        StudentResponse result = studentService.updateStudent(studentId, request);

        assertNotNull(result);
        verify(studentRepository).save(testStudent);
        verify(userRepository).save(testUser);
    }

    @Test
    void deleteStudent_ShouldDeleteStudent() {
        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
        doNothing().when(studentRepository).delete(testStudent);

        studentService.deleteStudent(studentId);

        verify(studentRepository).delete(testStudent);
    }

    @Test
    void assignToTeacher_ShouldAssignStudent() {
        UUID teacherId = UUID.randomUUID();
        Teacher teacher = new Teacher();
        teacher.setId(teacherId);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(teacher));
        when(studentRepository.save(any(Student.class))).thenReturn(testStudent);

        studentService.assignToTeacher(studentId, teacherId);

        assertEquals(teacher, testStudent.getTeacher());
        verify(studentRepository).save(testStudent);
    }

    @Test
    void unassignFromTeacher_ShouldUnassignStudent() {
        Teacher teacher = new Teacher();
        testStudent.setTeacher(teacher);

        when(studentRepository.findById(studentId)).thenReturn(Optional.of(testStudent));
        when(studentRepository.save(any(Student.class))).thenReturn(testStudent);

        studentService.unassignFromTeacher(studentId);

        assertNull(testStudent.getTeacher());
        verify(studentRepository).save(testStudent);
    }
}

