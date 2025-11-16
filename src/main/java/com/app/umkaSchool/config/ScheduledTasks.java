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
}

