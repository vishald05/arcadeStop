package com.arcadestop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class SequenceMasterSessionRequestDto {

    @NotBlank(message = "Session ID is required for idempotency")
    private String sessionId;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be negative")
    private Integer score;

    @NotNull(message = "Highest sequence length is required")
    @Min(value = 1, message = "Highest sequence length must be at least 1")
    private Integer highestSequenceLength;

    @NotNull(message = "Completed rounds is required")
    @Min(value = 0, message = "Completed rounds cannot be negative")
    private Integer completedRounds;

    @NotNull(message = "Total correct tiles is required")
    @Min(value = 0, message = "Total correct tiles cannot be negative")
    private Integer totalCorrectTiles;

    @NotNull(message = "Elapsed seconds is required")
    @Positive(message = "Elapsed seconds must be positive")
    private Double elapsedSeconds;

    public SequenceMasterSessionRequestDto() {
    }

    public SequenceMasterSessionRequestDto(String sessionId, String difficulty, Integer score,
                                          Integer highestSequenceLength, Integer completedRounds,
                                          Integer totalCorrectTiles, Double elapsedSeconds) {
        this.sessionId = sessionId;
        this.difficulty = difficulty;
        this.score = score;
        this.highestSequenceLength = highestSequenceLength;
        this.completedRounds = completedRounds;
        this.totalCorrectTiles = totalCorrectTiles;
        this.elapsedSeconds = elapsedSeconds;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
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
