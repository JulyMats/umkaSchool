package com.app.umkaSchool.controller;

import com.app.umkaSchool.dto.homework.CreateHomeworkRequest;
import com.app.umkaSchool.dto.homework.HomeworkResponse;
import com.app.umkaSchool.dto.homework.UpdateHomeworkRequest;
import com.app.umkaSchool.service.HomeworkService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/homework")
public class HomeworkController {

    private final HomeworkService homeworkService;

    @Autowired
    public HomeworkController(HomeworkService homeworkService) {
        this.homeworkService = homeworkService;
    }

    @PostMapping
    public ResponseEntity<HomeworkResponse> createHomework(@Valid @RequestBody CreateHomeworkRequest request) {
        HomeworkResponse response = homeworkService.createHomework(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{homeworkId}")
    public ResponseEntity<HomeworkResponse> updateHomework(
            @PathVariable UUID homeworkId,
            @Valid @RequestBody UpdateHomeworkRequest request) {
        HomeworkResponse response = homeworkService.updateHomework(homeworkId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{homeworkId}")
    public ResponseEntity<HomeworkResponse> getHomeworkById(@PathVariable UUID homeworkId) {
        HomeworkResponse response = homeworkService.getHomeworkById(homeworkId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<HomeworkResponse> getHomeworkByTitle(@PathVariable String title) {
        HomeworkResponse response = homeworkService.getHomeworkByTitle(title);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<HomeworkResponse>> getAllHomework() {
        List<HomeworkResponse> homework = homeworkService.getAllHomework();
        return ResponseEntity.ok(homework);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<HomeworkResponse>> getHomeworkByTeacher(@PathVariable UUID teacherId) {
        List<HomeworkResponse> homework = homeworkService.getHomeworkByTeacher(teacherId);
        return ResponseEntity.ok(homework);
    }

    @DeleteMapping("/{homeworkId}")
    public ResponseEntity<Void> deleteHomework(@PathVariable UUID homeworkId) {
        homeworkService.deleteHomework(homeworkId);
        return ResponseEntity.noContent().build();
    }
}


