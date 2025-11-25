package com.app.umkaSchool.config;

import com.app.umkaSchool.service.HomeworkAssignmentService;
import com.app.umkaSchool.service.ProgressSnapshotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {
    private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);
    private final ProgressSnapshotService progressSnapshotService;
    private final HomeworkAssignmentService homeworkAssignmentService;

    public ScheduledTasks(ProgressSnapshotService progressSnapshotService,
                         HomeworkAssignmentService homeworkAssignmentService) {
        this.progressSnapshotService = progressSnapshotService;
        this.homeworkAssignmentService = homeworkAssignmentService;
    }

    /**
     * Runs daily at 1:00 AM to cleanup duplicate snapshots from yesterday.
     * Deletes all snapshots from yesterday except the last one, if there were new attempts.
     * Cron format: second, minute, hour, day of month, month, day of week
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void cleanupYesterdaySnapshots() {
        logger.info("Starting scheduled cleanup of yesterday's duplicate snapshots");
        try {
            progressSnapshotService.cleanupYesterdaySnapshots();
            logger.info("Cleanup of yesterday's snapshots completed successfully");
        } catch (Exception e) {
            logger.error("Error during scheduled snapshot cleanup: {}", e.getMessage(), e);
        }
    }

    /**
     * Runs daily at 2:00 AM to check and update overdue homework assignments.
     * Updates assignments with due date in the past from PENDING to OVERDUE.
     * Cron format: second, minute, hour, day of month, month, day of week
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void updateOverdueAssignments() {
        logger.info("Starting scheduled update of overdue homework assignments");
        try {
            homeworkAssignmentService.updateOverdueAssignments();
            logger.info("Update of overdue assignments completed successfully");
        } catch (Exception e) {
            logger.error("Error during scheduled overdue assignments update: {}", e.getMessage(), e);
        }
    }
}

