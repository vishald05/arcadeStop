package com.arcadestop.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class NumberNinjaSessionRequestDto {

    @NotBlank(message = "Session ID is required for idempotency")
    private String sessionId;

    @NotNull(message = "Won status is required")
    private Boolean won;

    @NotNull(message = "Guesses used is required")
    @Min(value = 1, message = "Guesses used must be at least 1")
    @Max(value = 7, message = "Guesses used cannot exceed 7")
    private Integer guessesUsed;

    public NumberNinjaSessionRequestDto() {
    }

    public NumberNinjaSessionRequestDto(String sessionId, Boolean won, Integer guessesUsed) {
        this.sessionId = sessionId;
        this.won = won;
        this.guessesUsed = guessesUsed;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public Boolean getWon() {
        return won;
    }

    public void setWon(Boolean won) {
        this.won = won;
    }

    public Integer getGuessesUsed() {
        return guessesUsed;
    }

    public void setGuessesUsed(Integer guessesUsed) {
        this.guessesUsed = guessesUsed;
    }
}
