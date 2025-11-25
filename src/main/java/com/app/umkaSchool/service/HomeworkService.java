package com.app.umkaSchool.service;

import com.app.umkaSchool.dto.homework.CreateHomeworkRequest;
import com.app.umkaSchool.dto.homework.HomeworkResponse;
import com.app.umkaSchool.dto.homework.UpdateHomeworkRequest;
import com.app.umkaSchool.model.Homework;

import java.util.List;
import java.util.UUID;

public interface HomeworkService {
    HomeworkResponse createHomework(CreateHomeworkRequest request);

    HomeworkResponse updateHomework(UUID homeworkId, UpdateHomeworkRequest request);

    HomeworkResponse getHomeworkById(UUID homeworkId);

    HomeworkResponse getHomeworkByTitle(String title);

    List<HomeworkResponse> getAllHomework();

    List<HomeworkResponse> getHomeworkByTeacher(UUID teacherId);

    void deleteHomework(UUID homeworkId);

    Homework getHomeworkEntity(UUID homeworkId);
}

