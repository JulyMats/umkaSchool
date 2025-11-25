package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.group.CreateGroupRequest;
import com.app.umkaSchool.dto.group.GroupResponse;
import com.app.umkaSchool.dto.group.UpdateGroupRequest;
import com.app.umkaSchool.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupService groupService;

    @Autowired
    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<GroupResponse> createGroup(@Valid @RequestBody CreateGroupRequest request) {
        GroupResponse response = groupService.createGroup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{groupId}")
    public ResponseEntity<GroupResponse> updateGroup(
            @PathVariable UUID groupId,
            @Valid @RequestBody UpdateGroupRequest request) {
        GroupResponse response = groupService.updateGroup(groupId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<GroupResponse> getGroupById(@PathVariable UUID groupId) {
        GroupResponse response = groupService.getGroupById(groupId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<GroupResponse> getGroupByCode(@PathVariable String code) {
        GroupResponse response = groupService.getGroupByCode(code);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<GroupResponse>> getAllGroups() {
        List<GroupResponse> groups = groupService.getAllGroups();
        return ResponseEntity.ok(groups);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<GroupResponse>> getGroupsByTeacher(@PathVariable UUID teacherId) {
        List<GroupResponse> groups = groupService.getGroupsByTeacher(teacherId);
        return ResponseEntity.ok(groups);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity<Void> deleteGroup(@PathVariable UUID groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{groupId}/students")
    public ResponseEntity<Void> addStudentsToGroup(
            @PathVariable UUID groupId,
            @RequestBody List<UUID> studentIds) {
        groupService.addStudentsToGroup(groupId, studentIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/students/{studentId}")
    public ResponseEntity<Void> removeStudentFromGroup(@PathVariable UUID studentId) {
        groupService.removeStudentFromGroup(studentId);
        return ResponseEntity.ok().build();
    }
}