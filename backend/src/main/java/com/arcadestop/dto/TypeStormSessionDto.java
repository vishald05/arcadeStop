package com.arcadestop.dto;

import com.arcadestop.entity.TypeStormSession;

import java.time.LocalDateTime;

public class TypeStormSessionDto {

    private String sessionId;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private Integer durationSeconds;
    private Integer wpm;
    private Double accuracy;
    private Integer correctCharacters;
    private Integer incorrectCharacters;
    private Integer totalCharactersTyped;
    private Double elapsedSeconds;

    public TypeStormSessionDto() {
    }

    public TypeStormSessionDto(String sessionId, LocalDateTime createdAt,
                              Integer durationSeconds, Integer wpm, Double accuracy,
                              Integer correctCharacters, Integer incorrectCharacters,
                              Integer totalCharactersTyped, Double elapsedSeconds) {
        this.sessionId = sessionId;
        this.completedAt = createdAt;
        this.createdAt = createdAt;
        this.durationSeconds = durationSeconds;
        this.wpm = wpm;
        this.accuracy = accuracy;
        this.correctCharacters = correctCharacters;
        this.incorrectCharacters = incorrectCharacters;
        this.totalCharactersTyped = totalCharactersTyped;
        this.elapsedSeconds = elapsedSeconds;
    }

    public static TypeStormSessionDto fromEntity(TypeStormSession entity) {
        if (entity == null) {
            return null;
        }
        return new TypeStormSessionDto(
                entity.getSessionId(),
                entity.getCreatedAt(),
                entity.getDurationSeconds(),
                entity.getWpm(),
                entity.getAccuracy(),
                entity.getCorrectCharacters(),
                entity.getIncorrectCharacters(),
                entity.getTotalCharactersTyped(),
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
}
