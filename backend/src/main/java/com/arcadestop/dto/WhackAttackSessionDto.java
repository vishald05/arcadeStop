package com.arcadestop.dto;

import com.arcadestop.entity.WhackAttackSession;

import java.time.LocalDateTime;

public class WhackAttackSessionDto {

    private String sessionId;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private Integer durationSeconds;
    private Integer score;
    private Integer hits;
    private Integer misses;
    private Integer emptyClicks;
    private Double accuracy;
    private Integer bestCombo;
    private Double elapsedSeconds;

    public WhackAttackSessionDto() {
    }

    public WhackAttackSessionDto(String sessionId, LocalDateTime createdAt,
                                Integer durationSeconds, Integer score, Integer hits,
                                Integer misses, Integer emptyClicks, Double accuracy,
                                Integer bestCombo, Double elapsedSeconds) {
        this.sessionId = sessionId;
        this.completedAt = createdAt;
        this.createdAt = createdAt;
        this.durationSeconds = durationSeconds;
        this.score = score;
        this.hits = hits;
        this.misses = misses;
        this.emptyClicks = emptyClicks;
        this.accuracy = accuracy;
        this.bestCombo = bestCombo;
        this.elapsedSeconds = elapsedSeconds;
    }

    public static WhackAttackSessionDto fromEntity(WhackAttackSession entity) {
        if (entity == null) {
            return null;
        }
        return new WhackAttackSessionDto(
                entity.getSessionId(),
                entity.getCreatedAt(),
                entity.getDurationSeconds(),
                entity.getScore(),
                entity.getHits(),
                entity.getMisses(),
                entity.getEmptyClicks(),
                entity.getAccuracy(),
                entity.getBestCombo(),
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

    public Integer getDurationSeconds() {
        return durationSeconds;
    }

    public void setDurationSeconds(Integer durationSeconds) {
        this.durationSeconds = durationSeconds;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getHits() {
        return hits;
    }

    public void setHits(Integer hits) {
        this.hits = hits;
    }

    public Integer getMisses() {
        return misses;
    }

    public void setMisses(Integer misses) {
        this.misses = misses;
    }

    public Integer getEmptyClicks() {
        return emptyClicks;
    }

    public void setEmptyClicks(Integer emptyClicks) {
        this.emptyClicks = emptyClicks;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Integer getBestCombo() {
        return bestCombo;
    }

    public Integer getHighestCombo() {
        return bestCombo;
    }

    public void setBestCombo(Integer bestCombo) {
        this.bestCombo = bestCombo;
    }

    public Double getElapsedSeconds() {
        return elapsedSeconds;
    }

    public void setElapsedSeconds(Double elapsedSeconds) {
        this.elapsedSeconds = elapsedSeconds;
    }
}
