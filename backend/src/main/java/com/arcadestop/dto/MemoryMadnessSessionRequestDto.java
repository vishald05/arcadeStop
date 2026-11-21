package com.arcadestop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class MemoryMadnessSessionRequestDto {

    @NotBlank(message = "Session ID is required for idempotency")
    private String sessionId;

    @NotBlank(message = "Difficulty is required")
    private String difficulty;

    @NotNull(message = "Score is required")
    @Min(value = 0, message = "Score cannot be negative")
    private Integer score;

    @NotNull(message = "Completion time is required")
    @Positive(message = "Completion time must be positive")
    private Double completionTimeSeconds;

    @NotNull(message = "Total moves is required")
    @Min(value = 1, message = "Total moves must be at least 1")
    private Integer totalMoves;

    @NotNull(message = "Matched pairs is required")
    @Min(value = 1, message = "Matched pairs must be at least 1")
    private Integer matchedPairs;

    @NotNull(message = "Mismatched attempts is required")
    @Min(value = 0, message = "Mismatched attempts cannot be negative")
    private Integer mismatchedAttempts;

    @NotNull(message = "Accuracy is required")
    @Min(value = 0, message = "Accuracy cannot be negative")
    private Double accuracy;

    public MemoryMadnessSessionRequestDto() {
    }

    public MemoryMadnessSessionRequestDto(String sessionId, String difficulty, Integer score,
                                         Double completionTimeSeconds, Integer totalMoves,
                                         Integer matchedPairs, Integer mismatchedAttempts,
                                         Double accuracy) {
        this.sessionId = sessionId;
        this.difficulty = difficulty;
        this.score = score;
        this.completionTimeSeconds = completionTimeSeconds;
        this.totalMoves = totalMoves;
        this.matchedPairs = matchedPairs;
        this.mismatchedAttempts = mismatchedAttempts;
        this.accuracy = accuracy;
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

    public Double getCompletionTimeSeconds() {
        return completionTimeSeconds;
    }

    public void setCompletionTimeSeconds(Double completionTimeSeconds) {
        this.completionTimeSeconds = completionTimeSeconds;
    }

    public Integer getTotalMoves() {
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
