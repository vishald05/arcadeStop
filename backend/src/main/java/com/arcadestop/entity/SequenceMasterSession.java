package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "sequence_master_sessions", indexes = {
    @Index(name = "idx_seq_master_sessions_browser_id", columnList = "browser_id"),
    @Index(name = "idx_seq_master_sessions_session_id", columnList = "session_id")
})
public class SequenceMasterSession {

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

    @Column(name = "highest_sequence_length", nullable = false)
    private Integer highestSequenceLength;

    @Column(name = "completed_rounds", nullable = false)
    private Integer completedRounds;

    @Column(name = "total_correct_tiles", nullable = false)
    private Integer totalCorrectTiles;

    @Column(name = "elapsed_seconds", nullable = false)
    private Double elapsedSeconds;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public SequenceMasterSession() {
    }

    public SequenceMasterSession(String browserId, String sessionId, String difficulty,
                                 Integer score, Integer highestSequenceLength,
                                 Integer completedRounds, Integer totalCorrectTiles,
                                 Double elapsedSeconds) {
        this.browserId = browserId;
        this.sessionId = sessionId;
        this.difficulty = difficulty;
        this.score = score;
        this.highestSequenceLength = highestSequenceLength;
        this.completedRounds = completedRounds;
        this.totalCorrectTiles = totalCorrectTiles;
        this.elapsedSeconds = elapsedSeconds;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
