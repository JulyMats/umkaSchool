package com.app.umkaSchool.dto;

public class FinishAttemptRequest {
    private int problemsSolved; // score
    private long totalAttempts;
    private long totalCorrect;
    private int currentStreak;

    public int getProblemsSolved() { return problemsSolved; }
    public void setProblemsSolved(int problemsSolved) { this.problemsSolved = problemsSolved; }
    public long getTotalAttempts() { return totalAttempts; }
    public void setTotalAttempts(long totalAttempts) { this.totalAttempts = totalAttempts; }
    public long getTotalCorrect() { return totalCorrect; }
    public void setTotalCorrect(long totalCorrect) { this.totalCorrect = totalCorrect; }
    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }
}

