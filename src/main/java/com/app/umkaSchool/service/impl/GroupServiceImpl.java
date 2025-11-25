package com.app.umkaSchool.service.impl;

import com.app.umkaSchool.dto.group.CreateGroupRequest;
import com.app.umkaSchool.dto.group.GroupResponse;
import com.app.umkaSchool.dto.group.UpdateGroupRequest;
import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.model.StudentGroup;
import com.app.umkaSchool.model.Teacher;
import com.app.umkaSchool.repository.StudentGroupRepository;
import com.app.umkaSchool.repository.StudentRepository;
import com.app.umkaSchool.repository.TeacherRepository;
import com.app.umkaSchool.service.GroupService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {
    private static final Logger logger = LoggerFactory.getLogger(GroupServiceImpl.class);

    private final StudentGroupRepository groupRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    @Autowired
    public GroupServiceImpl(StudentGroupRepository groupRepository,
                           TeacherRepository teacherRepository,
                           StudentRepository studentRepository) {
        this.groupRepository = groupRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional
    public GroupResponse createGroup(CreateGroupRequest request) {
        logger.info("Creating new group: {}", request.getName());

        if (groupRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Group code already exists");
        }

        if (groupRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Group name already exists");
        }

        Teacher teacher = teacherRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        StudentGroup group = new StudentGroup();
        group.setId(UUID.randomUUID());
        group.setName(request.getName());
        group.setCode(request.getCode().toUpperCase());
        group.setDescription(request.getDescription());
        group.setTeacher(teacher);
        group = groupRepository.save(group);

        // Add students to group if provided
        if (request.getStudentIds() != null && !request.getStudentIds().isEmpty()) {
            for (UUID studentId : request.getStudentIds()) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
                student.setGroup(group);
                studentRepository.save(student);
            }
        }

        logger.info("Group created successfully: {}", group.getId());
        return mapToResponse(group);
    }

    @Override
    @Transactional
    public GroupResponse updateGroup(UUID groupId, UpdateGroupRequest request) {
        logger.info("Updating group: {}", groupId);

        StudentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (request.getName() != null) {
            if (!request.getName().equals(group.getName()) && groupRepository.existsByName(request.getName())) {
                throw new IllegalArgumentException("Group name already exists");
            }
            group.setName(request.getName());
        }

        if (request.getDescription() != null) {
            group.setDescription(request.getDescription());
        }

        if (request.getTeacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            group.setTeacher(teacher);
        }

        group = groupRepository.save(group);

        // Update students in group if provided
        if (request.getStudentIds() != null) {
            // Remove all current students from group
            List<Student> currentStudents = studentRepository.findByGroup_Id(groupId);
            for (Student student : currentStudents) {
                student.setGroup(null);
                studentRepository.save(student);
            }

            // Add new students to group
            for (UUID studentId : request.getStudentIds()) {
                Student student = studentRepository.findById(studentId)
                        .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
                student.setGroup(group);
                studentRepository.save(student);
            }
        }

        logger.info("Group updated successfully: {}", groupId);
        return mapToResponse(group);
    }

    @Override
    public GroupResponse getGroupById(UUID groupId) {
        StudentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        return mapToResponse(group);
    }

    @Override
    public GroupResponse getGroupByCode(String code) {
        StudentGroup group = groupRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        return mapToResponse(group);
    }

    @Override
    public List<GroupResponse> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupResponse> getGroupsByTeacher(UUID teacherId) {
        return groupRepository.findByTeacher_Id(teacherId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteGroup(UUID groupId) {
        logger.info("Deleting group: {}", groupId);

        StudentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        // Remove group from all students
        List<Student> students = studentRepository.findByGroup_Id(groupId);
        for (Student student : students) {
            student.setGroup(null);
            studentRepository.save(student);
        }

        groupRepository.delete(group);
        logger.info("Group deleted successfully: {}", groupId);
    }

    @Override
    @Transactional
    public void addStudentsToGroup(UUID groupId, List<UUID> studentIds) {
        StudentGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        for (UUID studentId : studentIds) {
            Student student = studentRepository.findById(studentId)
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + studentId));
            student.setGroup(group);
            studentRepository.save(student);
        }
    }

    @Override
    @Transactional
    public void removeStudentFromGroup(UUID studentId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        student.setGroup(null);
        studentRepository.save(student);
    }

    @Override
    public StudentGroup getGroupEntity(UUID groupId) {
        return groupRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
    }

    private GroupResponse mapToResponse(StudentGroup group) {
        int studentCount = studentRepository.findByGroup_Id(group.getId()).size();

        String teacherName = group.getTeacher() != null ?
                group.getTeacher().getUser().getFirstName() + " " +
                group.getTeacher().getUser().getLastName() : null;

        return GroupResponse.builder()
                .id(group.getId())
                .name(group.getName())
                .code(group.getCode())
                .description(group.getDescription())
                .teacherId(group.getTeacher() != null ? group.getTeacher().getId() : null)
                .teacherName(teacherName)
                .studentCount(studentCount)
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }
}
