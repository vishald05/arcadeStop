package com.arcadestop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class WhackAttackSessionRequestDto {

    @NotBlank(message = "Session ID is required for idempotency")
    private String sessionId;

    @NotNull(message = "Duration in seconds is required")
    private Integer durationSeconds;

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be negative")
    private Integer score;

    @NotNull(message = "Hits is required")
    @Min(value = 0, message = "Hits cannot be negative")
    private Integer hits;

    @NotNull(message = "Misses is required")
    @Min(value = 0, message = "Misses cannot be negative")
    private Integer misses;

    @NotNull(message = "Empty clicks is required")
    @Min(value = 0, message = "Empty clicks cannot be negative")
    private Integer emptyClicks;

    @NotNull(message = "Best combo is required")
    @Min(value = 0, message = "Best combo cannot be negative")
    private Integer bestCombo;

    @NotNull(message = "Elapsed seconds is required")
    @Positive(message = "Elapsed seconds must be positive")
    private Double elapsedSeconds;

    public WhackAttackSessionRequestDto() {
    }

    public WhackAttackSessionRequestDto(String sessionId, Integer durationSeconds, Integer score,
                                       Integer hits, Integer misses, Integer emptyClicks,
                                       Integer bestCombo, Double elapsedSeconds) {
        this.sessionId = sessionId;
        this.durationSeconds = durationSeconds;
        this.score = score;
        this.hits = hits;
        this.misses = misses;
        this.emptyClicks = emptyClicks;
        this.bestCombo = bestCombo;
        this.elapsedSeconds = elapsedSeconds;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
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

    public Integer getBestCombo() {
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
