package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "memory_madness_sessions", indexes = {
    @Index(name = "idx_mem_madness_sessions_browser_id", columnList = "browser_id"),
    @Index(name = "idx_mem_madness_sessions_session_id", columnList = "session_id")
})
public class MemoryMadnessSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Browser ID is required")
    @Column(name = "browser_id", nullable = false, length = 36)
    private String browserId;

    @NotBlank(message = "Session ID is required")
    @Column(name = "session_id", nullable = false, unique = true, length = 64)
    private String sessionId;

    @NotBlank(message = "Difficulty is required")
    @Column(name = "difficulty", nullable = false, length = 16)
    private String difficulty;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "completion_time_seconds", nullable = false)
    private Double completionTimeSeconds;

    @Column(name = "total_moves", nullable = false)
    private Integer totalMoves;

    @Column(name = "matched_pairs", nullable = false)
    private Integer matchedPairs;

    @Column(name = "mismatched_attempts", nullable = false)
    private Integer mismatchedAttempts;

    @Column(name = "accuracy", nullable = false)
    private Double accuracy;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public MemoryMadnessSession() {
    }

    public MemoryMadnessSession(String browserId, String sessionId, String difficulty,
                                Integer score, Double completionTimeSeconds,
                                Integer totalMoves, Integer matchedPairs,
                                Integer mismatchedAttempts, Double accuracy) {
        this.browserId = browserId;
        this.sessionId = sessionId;
        this.difficulty = difficulty;
        this.score = score;
        this.completionTimeSeconds = completionTimeSeconds;
        this.totalMoves = totalMoves;
        this.matchedPairs = matchedPairs;
        this.mismatchedAttempts = mismatchedAttempts;
        this.accuracy = accuracy;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBrowserId() {
        return browserId;
    }

    public void setBrowserId(String browserId) {
        this.browserId = browserId;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
