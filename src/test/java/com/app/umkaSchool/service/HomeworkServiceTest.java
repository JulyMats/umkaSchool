package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.homework.CreateHomeworkRequest;
import com.app.umkaSchool.dto.homework.HomeworkResponse;
import com.app.umkaSchool.dto.homework.UpdateHomeworkRequest;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.Homework;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.HomeworkRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.ExerciseService;
import com.app.umkaSchool.service.impl.HomeworkServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class HomeworkServiceTest {

    @Mock
    private HomeworkRepository homeworkRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private com.app.umkaSchool.repository.ExerciseRepository exerciseRepository;

    @Mock
    private ExerciseService exerciseService;

    @InjectMocks
    private HomeworkServiceImpl homeworkService;

    private Homework testHomework;
    private Teacher testTeacher;
    private UUID homeworkId;
    private UUID teacherId;

    @BeforeEach
    void setUp() {
        homeworkId = UUID.randomUUID();
        teacherId = UUID.randomUUID();

        com.app.umkaSchool.model.AppUser teacherUser = new com.app.umkaSchool.model.AppUser();
        teacherUser.setId(UUID.randomUUID());
        teacherUser.setFirstName("Teacher");
        teacherUser.setLastName("Name");
        teacherUser.setEmail("teacher@example.com");

        testTeacher = new Teacher();
        testTeacher.setId(teacherId);
        testTeacher.setUser(teacherUser);

        testHomework = new Homework();
        testHomework.setId(homeworkId);
        testHomework.setTitle("Test Homework");
        testHomework.setDescription("Test Description");
        testHomework.setTeacher(testTeacher);
        testHomework.setCreatedAt(ZonedDateTime.now());
        testHomework.setExercises(new java.util.HashSet<>()); 
    }

    @Test
    void getAllHomework_ShouldReturnList() {
        when(homeworkRepository.findAllByOrderByCreatedAtDesc()).thenReturn(List.of(testHomework));

        List<HomeworkResponse> result = homeworkService.getAllHomework();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(homeworkRepository).findAllByOrderByCreatedAtDesc();
    }

    @Test
    void getHomeworkById_ShouldReturnHomework() {
        when(homeworkRepository.findById(homeworkId)).thenReturn(Optional.of(testHomework));

        HomeworkResponse result = homeworkService.getHomeworkById(homeworkId);

        assertNotNull(result);
        assertEquals(homeworkId, result.getId());
        verify(homeworkRepository).findById(homeworkId);
    }

    @Test
    void getHomeworkById_WhenNotFound_ShouldThrowException() {
        when(homeworkRepository.findById(homeworkId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            homeworkService.getHomeworkById(homeworkId);
        });
    }

    @Test
    void createHomework_ShouldCreateHomework() {
        CreateHomeworkRequest request = new CreateHomeworkRequest();
        request.setTitle("New Homework");
        request.setDescription("New Description");
        request.setTeacherId(teacherId);
        request.setExerciseIds(List.of());

        when(homeworkRepository.existsByTitle(anyString())).thenReturn(false);
        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(testTeacher));
        when(homeworkRepository.saveAndFlush(any(Homework.class))).thenAnswer(invocation -> {
            Homework h = invocation.getArgument(0);
            h.setId(homeworkId);
            return h;
        });

        HomeworkResponse result = homeworkService.createHomework(request);

        assertNotNull(result);
        verify(homeworkRepository).saveAndFlush(any(Homework.class));
    }

    @Test
    void updateHomework_ShouldUpdateHomework() {
        UpdateHomeworkRequest request = new UpdateHomeworkRequest();
        request.setTitle("Updated Homework");
        request.setDescription("Updated Description");

        when(homeworkRepository.findById(homeworkId)).thenReturn(Optional.of(testHomework));
        when(homeworkRepository.existsByTitle(anyString())).thenReturn(false);
        when(homeworkRepository.save(any(Homework.class))).thenReturn(testHomework);

        HomeworkResponse result = homeworkService.updateHomework(homeworkId, request);

        assertNotNull(result);
        verify(homeworkRepository).save(testHomework);
    }

    @Test
    void deleteHomework_ShouldDeleteHomework() {
        when(homeworkRepository.findById(homeworkId)).thenReturn(Optional.of(testHomework));
        doNothing().when(homeworkRepository).delete(testHomework);

        homeworkService.deleteHomework(homeworkId);

        verify(homeworkRepository).delete(testHomework);
    }
}

