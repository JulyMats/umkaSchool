package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.HomeworkAssignmentStudent;
import com.app.umkaSchool.model.HomeworkAssignmentStudentId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface HomeworkAssignmentStudentRepository extends JpaRepository<HomeworkAssignmentStudent, HomeworkAssignmentStudentId> {
    Optional<HomeworkAssignmentStudent> findById_HomeworkAssignmentIdAndId_StudentId(UUID homeworkAssignmentId, UUID studentId);
}

