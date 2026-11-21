package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "whack_attack_sessions", indexes = {
    @Index(name = "idx_whack_attack_sessions_browser_id", columnList = "browser_id"),
    @Index(name = "idx_whack_attack_sessions_session_id", columnList = "session_id")
})
public class WhackAttackSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Browser ID is required")
    @Column(name = "browser_id", nullable = false, length = 36)
    private String browserId;

    @NotBlank(message = "Session ID is required")
    @Column(name = "session_id", nullable = false, unique = true, length = 64)
    private String sessionId;

    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "hits", nullable = false)
    private Integer hits;

    @Column(name = "misses", nullable = false)
    private Integer misses;

    @Column(name = "empty_clicks", nullable = false)
    private Integer emptyClicks;

    @Column(name = "accuracy", nullable = false)
    private Double accuracy;

    @Column(name = "best_combo", nullable = false)
    private Integer bestCombo;

    @Column(name = "elapsed_seconds", nullable = false)
    private Double elapsedSeconds;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public WhackAttackSession() {
    }

    public WhackAttackSession(String browserId, String sessionId, Integer durationSeconds,
                              Integer score, Integer hits, Integer misses, Integer emptyClicks,
                              Double accuracy, Integer bestCombo, Double elapsedSeconds) {
        this.browserId = browserId;
        this.sessionId = sessionId;
        this.durationSeconds = durationSeconds;
        this.score = score;
        this.hits = hits;
        this.misses = misses;
        this.emptyClicks = emptyClicks;
        this.accuracy = accuracy;
        this.bestCombo = bestCombo;
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

    public void setBestCombo(Integer bestCombo) {
        this.bestCombo = bestCombo;
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
