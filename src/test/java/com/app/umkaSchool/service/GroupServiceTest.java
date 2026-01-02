package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.group.CreateGroupRequest;
import com.app.umkaSchool.dto.group.GroupResponse;
import com.app.umkaSchool.dto.group.UpdateGroupRequest;
import com.app.umkaSchool.exception.ResourceNotFoundException;
import com.app.umkaSchool.model.AppUser;
import com.app.umkaSchool.model.StudentGroup;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.StudentGroupRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.impl.GroupServiceImpl;
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
class GroupServiceTest {

    @Mock
    private StudentGroupRepository groupRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private com.app.umkaSchool.repository.StudentRepository studentRepository;

    @InjectMocks
    private GroupServiceImpl groupService;

    private StudentGroup testGroup;
    private Teacher testTeacher;
    private UUID groupId;
    private UUID teacherId;

    @BeforeEach
    void setUp() {
        groupId = UUID.randomUUID();
        teacherId = UUID.randomUUID();

        AppUser teacherUser = new AppUser();
        teacherUser.setId(UUID.randomUUID());
        teacherUser.setFirstName("Teacher");
        teacherUser.setLastName("Name");
        teacherUser.setEmail("teacher@example.com");

        testTeacher = new Teacher();
        testTeacher.setId(teacherId);
        testTeacher.setUser(teacherUser);

        testGroup = new StudentGroup();
        testGroup.setId(groupId);
        testGroup.setName("Test Group");
        testGroup.setCode("TG001");
        testGroup.setDescription("Test Description");
        testGroup.setTeacher(testTeacher);
    }

    @Test
    void getAllGroups_ShouldReturnList() {
        when(groupRepository.findAll()).thenReturn(List.of(testGroup));
        when(studentRepository.findByGroup_Id(any(UUID.class))).thenReturn(List.of());

        List<GroupResponse> result = groupService.getAllGroups();

        assertNotNull(result);
        assertFalse(result.isEmpty());
        verify(groupRepository).findAll();
    }

    @Test
    void getGroupById_ShouldReturnGroup() {
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(testGroup));
        when(studentRepository.findByGroup_Id(groupId)).thenReturn(List.of());

        GroupResponse result = groupService.getGroupById(groupId);

        assertNotNull(result);
        assertEquals(groupId, result.getId());
        verify(groupRepository).findById(groupId);
    }

    @Test
    void getGroupById_WhenNotFound_ShouldThrowException() {
        when(groupRepository.findById(groupId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            groupService.getGroupById(groupId);
        });
    }

    @Test
    void createGroup_ShouldCreateGroup() {
        CreateGroupRequest request = new CreateGroupRequest();
        request.setName("New Group");
        request.setCode("NG001");
        request.setDescription("New Description");
        request.setTeacherId(teacherId);

        when(teacherRepository.findById(teacherId)).thenReturn(Optional.of(testTeacher));
        when(groupRepository.existsByCode(anyString())).thenReturn(false);
        when(groupRepository.existsByName(anyString())).thenReturn(false);
        when(groupRepository.save(any(StudentGroup.class))).thenAnswer(invocation -> {
            StudentGroup g = invocation.getArgument(0);
            g.setId(groupId);
            return g;
        });
        when(studentRepository.findByGroup_Id(any(UUID.class))).thenReturn(List.of());

        GroupResponse result = groupService.createGroup(request);

        assertNotNull(result);
        verify(groupRepository).save(any(StudentGroup.class));
    }

    @Test
    void updateGroup_ShouldUpdateGroup() {
        UpdateGroupRequest request = new UpdateGroupRequest();
        request.setName("Updated Group");
        request.setDescription("Updated Description");

        when(groupRepository.findById(groupId)).thenReturn(Optional.of(testGroup));
        when(groupRepository.existsByName(anyString())).thenReturn(false);
        when(groupRepository.save(any(StudentGroup.class))).thenReturn(testGroup);
        when(studentRepository.findByGroup_Id(groupId)).thenReturn(List.of());

        GroupResponse result = groupService.updateGroup(groupId, request);

        assertNotNull(result);
        verify(groupRepository).save(testGroup);
    }

    @Test
    void deleteGroup_ShouldDeleteGroup() {
        when(groupRepository.findById(groupId)).thenReturn(Optional.of(testGroup));
        when(studentRepository.findByGroup_Id(groupId)).thenReturn(List.of());
        doNothing().when(groupRepository).delete(testGroup);

        groupService.deleteGroup(groupId);

        verify(groupRepository).delete(testGroup);
    }
}

