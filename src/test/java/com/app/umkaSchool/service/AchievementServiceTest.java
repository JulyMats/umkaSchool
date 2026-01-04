package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.achievement.AchievementResponse;
import com.app.umkaSchool.model.Achievement;
import com.app.umkaSchool.model.StudentAchievement;
import com.app.umkaSchool.model.StudentAchievementId;
import com.app.umkaSchool.repository.AchievementRepository;
import com.app.umkaSchool.repository.StudentAchievementRepository;
import com.app.umkaSchool.service.ProgressSnapshotService;
import com.app.umkaSchool.service.impl.AchievementServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class AchievementServiceTest {

    @Mock
    private AchievementRepository achievementRepository;

    @Mock
    private StudentAchievementRepository studentAchievementRepository;

    @Mock
    private ProgressSnapshotService progressSnapshotService;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private AchievementServiceImpl achievementService;

    private Achievement testAchievement;
    private StudentAchievement testStudentAchievement;
    private UUID achievementId;
    private UUID studentId;

    @BeforeEach
    void setUp() {
        achievementId = UUID.randomUUID();
        studentId = UUID.randomUUID();

        testAchievement = new Achievement();
        testAchievement.setId(achievementId);
        testAchievement.setName("Test Achievement");
        testAchievement.setDescription("Test Description");
        testAchievement.setIconUrl("/icons/test.png");

        StudentAchievementId id = new StudentAchievementId();
        id.setStudentId(studentId);
        id.setAchievementId(achievementId);
        
        testStudentAchievement = new StudentAchievement();
        testStudentAchievement.setId(id);
        testStudentAchievement.setAchievement(testAchievement);
        testStudentAchievement.setEarnedAt(ZonedDateTime.now());
    }

    @Test
    void getAllAchievements_ShouldReturnList() {
        when(achievementRepository.findAll()).thenReturn(List.of(testAchievement));

        List<AchievementResponse> result = achievementService.getAllAchievements();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(achievementRepository).findAll();
    }

    @Test
    void getStudentAchievements_ShouldReturnList() {
        when(studentAchievementRepository.findByStudent_Id(studentId)).thenReturn(List.of(testStudentAchievement));

        List<AchievementResponse> result = achievementService.getStudentAchievements(studentId);

        assertNotNull(result);
        verify(studentAchievementRepository).findByStudent_Id(studentId);
    }

    @Test
    void getRecentStudentAchievements_ShouldReturnList() {
        when(studentAchievementRepository.findByStudent_Id(studentId)).thenReturn(List.of(testStudentAchievement));

        List<AchievementResponse> result = achievementService.getRecentStudentAchievements(studentId, 24);

        assertNotNull(result);
        verify(studentAchievementRepository).findByStudent_Id(studentId);
    }
}

