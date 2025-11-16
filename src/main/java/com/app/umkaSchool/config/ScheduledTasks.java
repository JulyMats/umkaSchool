package com.app.umkaSchool.config;

import com.app.umkaSchool.service.ProgressSnapshotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScheduledTasks {
    private static final Logger logger = LoggerFactory.getLogger(ScheduledTasks.class);
    private final ProgressSnapshotService progressSnapshotService;

    public ScheduledTasks(ProgressSnapshotService progressSnapshotService) {
        this.progressSnapshotService = progressSnapshotService;
    }

    /**
     * Runs daily at 1:00 AM to create/update progress snapshots for all students
     * Cron format: second, minute, hour, day of month, month, day of week
     */
    @Scheduled(cron = "0 0 1 * * ?")
    public void createDailyProgressSnapshots() {
        logger.info("Starting scheduled daily progress snapshot creation");
        try {
            progressSnapshotService.createSnapshotsForAllStudentsToday();
            logger.info("Daily progress snapshot creation completed successfully");
        } catch (Exception e) {
            logger.error("Error during scheduled progress snapshot creation: {}", e.getMessage(), e);
        }
    }
}

