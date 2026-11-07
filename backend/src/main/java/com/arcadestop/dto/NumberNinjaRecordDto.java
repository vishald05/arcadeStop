package com.arcadestop.dto;

import com.arcadestop.entity.NumberNinjaRecord;
import java.time.LocalDateTime;

public class NumberNinjaRecordDto {

    private Long id;
    private String browserId;
    private Integer totalGamesPlayed;
    private Integer totalGamesWon;
    private Integer totalGuessesInWins;
    private Integer bestGuesses;
    private Integer currentWinStreak;
    private Integer bestWinStreak;
    private Double winPercentage;
    private Double averageGuessesPerWin;
    private LocalDateTime updatedAt;
    private boolean isNewPersonalBest;

    public NumberNinjaRecordDto() {
    }

    public NumberNinjaRecordDto(Long id, String browserId, Integer totalGamesPlayed, Integer totalGamesWon,
                                Integer totalGuessesInWins, Integer bestGuesses, Integer currentWinStreak,
                                Integer bestWinStreak, Double winPercentage, Double averageGuessesPerWin,
                                LocalDateTime updatedAt, boolean isNewPersonalBest) {
        this.id = id;
        this.browserId = browserId;
        this.totalGamesPlayed = totalGamesPlayed;
        this.totalGamesWon = totalGamesWon;
        this.totalGuessesInWins = totalGuessesInWins;
        this.bestGuesses = bestGuesses;
        this.currentWinStreak = currentWinStreak;
        this.bestWinStreak = bestWinStreak;
        this.winPercentage = winPercentage;
        this.averageGuessesPerWin = averageGuessesPerWin;
        this.updatedAt = updatedAt;
        this.isNewPersonalBest = isNewPersonalBest;
    }

    public static NumberNinjaRecordDto fromEntity(NumberNinjaRecord record, boolean isNewPersonalBest) {
        if (record == null) {
            return null;
        }

        int played = record.getTotalGamesPlayed() != null ? record.getTotalGamesPlayed() : 0;
        int won = record.getTotalGamesWon() != null ? record.getTotalGamesWon() : 0;
        int guesses = record.getTotalGuessesInWins() != null ? record.getTotalGuessesInWins() : 0;

        double winPct = played > 0
                ? Math.round(((double) won / played * 100.0) * 10.0) / 10.0
                : 0.0;

        double avgGuesses = won > 0
                ? Math.round(((double) guesses / won) * 10.0) / 10.0
                : 0.0;

        return new NumberNinjaRecordDto(
                record.getId(),
                record.getBrowserId(),
                played,
                won,
                guesses,
                record.getBestGuesses(),
                record.getCurrentWinStreak() != null ? record.getCurrentWinStreak() : 0,
                record.getBestWinStreak() != null ? record.getBestWinStreak() : 0,
                winPct,
                avgGuesses,
                record.getUpdatedAt(),
                isNewPersonalBest
        );
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

    public Integer getTotalGamesPlayed() {
        return totalGamesPlayed;
    }

    public void setTotalGamesPlayed(Integer totalGamesPlayed) {
        this.totalGamesPlayed = totalGamesPlayed;
    }

    public Integer getTotalGamesWon() {
        return totalGamesWon;
    }

    public void setTotalGamesWon(Integer totalGamesWon) {
        this.totalGamesWon = totalGamesWon;
    }

    public Integer getTotalGuessesInWins() {
        return totalGuessesInWins;
    }

    public void setTotalGuessesInWins(Integer totalGuessesInWins) {
        this.totalGuessesInWins = totalGuessesInWins;
    }

    public Integer getBestGuesses() {
        return bestGuesses;
    }

    public void setBestGuesses(Integer bestGuesses) {
        this.bestGuesses = bestGuesses;
    }

    public Integer getCurrentWinStreak() {
        return currentWinStreak;
    }

    public void setCurrentWinStreak(Integer currentWinStreak) {
        this.currentWinStreak = currentWinStreak;
    }

    public Integer getBestWinStreak() {
        return bestWinStreak;
    }

    public void setBestWinStreak(Integer bestWinStreak) {
        this.bestWinStreak = bestWinStreak;
    }

    public Double getWinPercentage() {
        return winPercentage;
    }

    public void setWinPercentage(Double winPercentage) {
        this.winPercentage = winPercentage;
    }

    public Double getAverageGuessesPerWin() {
        return averageGuessesPerWin;
    }

    public void setAverageGuessesPerWin(Double averageGuessesPerWin) {
        this.averageGuessesPerWin = averageGuessesPerWin;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isNewPersonalBest() {
        return isNewPersonalBest;
    }

    public void setNewPersonalBest(boolean newPersonalBest) {
        isNewPersonalBest = newPersonalBest;
    }
}
