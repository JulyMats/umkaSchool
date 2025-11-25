package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.group.CreateGroupRequest;
import com.app.umkaSchool.dto.group.GroupResponse;
import com.app.umkaSchool.dto.group.UpdateGroupRequest;
import com.app.umkaSchool.model.StudentGroup;

import java.util.List;
import java.util.UUID;

public interface GroupService {
    GroupResponse createGroup(CreateGroupRequest request);

    GroupResponse updateGroup(UUID groupId, UpdateGroupRequest request);

    GroupResponse getGroupById(UUID groupId);

    GroupResponse getGroupByCode(String code);

    List<GroupResponse> getAllGroups();

    List<GroupResponse> getGroupsByTeacher(UUID teacherId);

    void deleteGroup(UUID groupId);

    void addStudentsToGroup(UUID groupId, List<UUID> studentIds);

    void removeStudentFromGroup(UUID studentId);

    StudentGroup getGroupEntity(UUID groupId);
}
