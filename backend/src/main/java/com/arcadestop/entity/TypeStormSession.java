package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "type_storm_sessions", indexes = {
    @Index(name = "idx_type_storm_sessions_browser_id", columnList = "browser_id"),
    @Index(name = "idx_type_storm_sessions_session_id", columnList = "session_id", unique = true)
})
public class TypeStormSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Browser ID is required")
    @Column(name = "browser_id", nullable = false, length = 36)
    private String browserId;

    @NotBlank(message = "Session ID is required")
    @Column(name = "session_id", nullable = false, unique = true, length = 64)
    private String sessionId;

    @NotNull
    @Column(name = "duration_seconds", nullable = false)
    private Integer durationSeconds;

    @NotNull
    @Column(name = "wpm", nullable = false)
    private Integer wpm;

    @NotNull
    @Column(name = "accuracy", nullable = false)
    private Double accuracy;

    @NotNull
    @Column(name = "correct_characters", nullable = false)
    private Integer correctCharacters;

    @NotNull
    @Column(name = "incorrect_characters", nullable = false)
    private Integer incorrectCharacters;

    @NotNull
    @Column(name = "total_characters_typed", nullable = false)
    private Integer totalCharactersTyped;

    @NotNull
    @Column(name = "elapsed_seconds", nullable = false)
    private Double elapsedSeconds;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public TypeStormSession() {
    }

    public TypeStormSession(String browserId, String sessionId, Integer durationSeconds,
                            Integer wpm, Double accuracy, Integer correctCharacters,
                            Integer incorrectCharacters, Integer totalCharactersTyped,
                            Double elapsedSeconds) {
        this.browserId = browserId;
        this.sessionId = sessionId;
        this.durationSeconds = durationSeconds;
        this.wpm = wpm;
        this.accuracy = accuracy;
        this.correctCharacters = correctCharacters;
        this.incorrectCharacters = incorrectCharacters;
        this.totalCharactersTyped = totalCharactersTyped;
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

    public Integer getWpm() {
        return wpm;
    }

    public void setWpm(Integer wpm) {
        this.wpm = wpm;
    }

    public Double getAccuracy() {
        return accuracy;
    }

    public void setAccuracy(Double accuracy) {
        this.accuracy = accuracy;
    }

    public Integer getCorrectCharacters() {
        return correctCharacters;
    }

    public void setCorrectCharacters(Integer correctCharacters) {
        this.correctCharacters = correctCharacters;
    }

    public Integer getIncorrectCharacters() {
        return incorrectCharacters;
    }

    public void setIncorrectCharacters(Integer incorrectCharacters) {
        this.incorrectCharacters = incorrectCharacters;
    }

    public Integer getTotalCharactersTyped() {
        return totalCharactersTyped;
    }

    public void setTotalCharactersTyped(Integer totalCharactersTyped) {
        this.totalCharactersTyped = totalCharactersTyped;
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
