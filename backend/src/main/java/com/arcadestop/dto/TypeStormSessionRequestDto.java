package com.arcadestop.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class TypeStormSessionRequestDto {

    @NotBlank(message = "Session ID is required for idempotency")
    private String sessionId;

    @NotNull(message = "Duration in seconds is required")
    private Integer durationSeconds;

    @NotNull(message = "Correct characters is required")
    @Min(value = 0, message = "Correct characters cannot be negative")
    private Integer correctCharacters;

    @NotNull(message = "Incorrect characters is required")
    @Min(value = 0, message = "Incorrect characters cannot be negative")
    private Integer incorrectCharacters;

    @NotNull(message = "Total characters typed is required")
    @Min(value = 0, message = "Total characters typed cannot be negative")
    private Integer totalCharactersTyped;

    @NotNull(message = "Elapsed seconds is required")
    @Positive(message = "Elapsed seconds must be positive")
    private Double elapsedSeconds;

    private Integer clientWpm;
    private Double clientAccuracy;

    public TypeStormSessionRequestDto() {
    }

    public TypeStormSessionRequestDto(String sessionId, Integer durationSeconds,
                                     Integer correctCharacters, Integer incorrectCharacters,
                                     Integer totalCharactersTyped, Double elapsedSeconds) {
        this.sessionId = sessionId;
        this.durationSeconds = durationSeconds;
        this.correctCharacters = correctCharacters;
        this.incorrectCharacters = incorrectCharacters;
        this.totalCharactersTyped = totalCharactersTyped;
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

    public Integer getClientWpm() {
        return clientWpm;
    }

    public void setClientWpm(Integer clientWpm) {
        this.clientWpm = clientWpm;
    }

    public Double getClientAccuracy() {
        return clientAccuracy;
    }

    public void setClientAccuracy(Double clientAccuracy) {
        this.clientAccuracy = clientAccuracy;
    }
}
