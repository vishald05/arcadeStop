package com.arcadestop.dto;

import com.arcadestop.entity.MemoryMadnessSession;

import java.time.LocalDateTime;

public class MemoryMadnessSessionDto {

    private String sessionId;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private String difficulty;
    private Integer score;
    private Double completionTimeSeconds;
    private Integer totalMoves;
    private Integer matchedPairs;
    private Integer mismatchedAttempts;
    private Double accuracy;

    public MemoryMadnessSessionDto() {
    }

    public MemoryMadnessSessionDto(String sessionId, LocalDateTime createdAt,
                                  String difficulty, Integer score,
                                  Double completionTimeSeconds, Integer totalMoves,
                                  Integer matchedPairs, Integer mismatchedAttempts,
                                  Double accuracy) {
        this.sessionId = sessionId;
        this.completedAt = createdAt;
        this.createdAt = createdAt;
        this.difficulty = difficulty;
        this.score = score;
        this.completionTimeSeconds = completionTimeSeconds;
        this.totalMoves = totalMoves;
        this.matchedPairs = matchedPairs;
        this.mismatchedAttempts = mismatchedAttempts;
        this.accuracy = accuracy;
    }

    public static MemoryMadnessSessionDto fromEntity(MemoryMadnessSession entity) {
        if (entity == null) {
            return null;
        }
        return new MemoryMadnessSessionDto(
                entity.getSessionId(),
                entity.getCreatedAt(),
                entity.getDifficulty(),
                entity.getScore(),
                entity.getCompletionTimeSeconds(),
                entity.getTotalMoves(),
                entity.getMatchedPairs(),
                entity.getMismatchedAttempts(),
                entity.getAccuracy()
        );
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Double getCompletionTimeSeconds() {
        return completionTimeSeconds;
    }

    public Double getCompletionTime() {
        return completionTimeSeconds;
    }

    public void setCompletionTimeSeconds(Double completionTimeSeconds) {
        this.completionTimeSeconds = completionTimeSeconds;
    }

    public Integer getTotalMoves() {
        return totalMoves;
    }

    public Integer getMoves() {
        return totalMoves;
    }

    public void setTotalMoves(Integer totalMoves) {
        this.totalMoves = totalMoves;
    }

    public Integer getMatchedPairs() {
        return matchedPairs;
    }

    public void setMatchedPairs(Integer matchedPairs) {
        this.matchedPairs = matchedPairs;
    }

    public Integer getMismatchedAttempts() {
        return mismatchedAttempts;
    }

    public Integer getMismatches() {
        return mismatchedAttempts;
    }

    public void setMismatchedAttempts(Integer mismatchedAttempts) {
        this.mismatchedAttempts = mismatchedAttempts;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }
}
