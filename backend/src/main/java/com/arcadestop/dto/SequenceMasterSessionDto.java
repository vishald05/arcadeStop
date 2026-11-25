package com.arcadestop.dto;

import com.arcadestop.entity.SequenceMasterSession;

import java.time.LocalDateTime;

public class SequenceMasterSessionDto {

    private String sessionId;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private String difficulty;
    private Integer score;
    private Integer highestSequenceLength;
    private Integer completedRounds;
    private Integer totalCorrectTiles;
    private Double elapsedSeconds;

    public SequenceMasterSessionDto() {
    }

    public SequenceMasterSessionDto(String sessionId, LocalDateTime createdAt,
                                   String difficulty, Integer score,
                                   Integer highestSequenceLength, Integer completedRounds,
                                   Integer totalCorrectTiles, Double elapsedSeconds) {
        this.sessionId = sessionId;
        this.completedAt = createdAt;
        this.createdAt = createdAt;
        this.difficulty = difficulty;
        this.score = score;
        this.highestSequenceLength = highestSequenceLength;
        this.completedRounds = completedRounds;
        this.totalCorrectTiles = totalCorrectTiles;
        this.elapsedSeconds = elapsedSeconds;
    }

    public static SequenceMasterSessionDto fromEntity(SequenceMasterSession entity) {
        if (entity == null) {
            return null;
        }
        return new SequenceMasterSessionDto(
                entity.getSessionId(),
                entity.getCreatedAt(),
                entity.getDifficulty(),
                entity.getScore(),
                entity.getHighestSequenceLength(),
                entity.getCompletedRounds(),
                entity.getTotalCorrectTiles(),
                entity.getElapsedSeconds()
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

    public Integer getHighestSequenceLength() {
        return highestSequenceLength;
    }

    public Integer getSequenceLength() {
        return highestSequenceLength;
    }

    public void setHighestSequenceLength(Integer highestSequenceLength) {
        this.highestSequenceLength = highestSequenceLength;
    }

    public Integer getCompletedRounds() {
        return completedRounds;
    }

    public void setCompletedRounds(Integer completedRounds) {
        this.completedRounds = completedRounds;
    }

    public Integer getTotalCorrectTiles() {
        return totalCorrectTiles;
    }

    public void setTotalCorrectTiles(Integer totalCorrectTiles) {
        this.totalCorrectTiles = totalCorrectTiles;
    }

    public Double getElapsedSeconds() {
        return elapsedSeconds;
    }

    public void setElapsedSeconds(Double elapsedSeconds) {
        this.elapsedSeconds = elapsedSeconds;
    }
}
