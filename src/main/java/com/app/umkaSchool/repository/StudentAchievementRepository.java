package com.app.umkaSchool.repository;

import com.app.umkaSchool.model.Student;
import com.app.umkaSchool.model.StudentAchievement;
import com.app.umkaSchool.model.StudentAchievementId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentAchievementRepository extends JpaRepository<StudentAchievement, StudentAchievementId> {
    @Query("SELECT sa FROM StudentAchievement sa JOIN FETCH sa.achievement WHERE sa.student.id = :studentId ORDER BY sa.earnedAt DESC")
    List<StudentAchievement> findByStudent_Id(@Param("studentId") UUID studentId);
    
    boolean existsByStudent_IdAndAchievement_Id(UUID studentId, UUID achievementId);
}


