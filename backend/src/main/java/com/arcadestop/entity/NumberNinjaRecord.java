package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "number_ninja_records", uniqueConstraints = {
    @UniqueConstraint(name = "uk_number_ninja_browser_id", columnNames = "browser_id")
})
public class NumberNinjaRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Browser ID is required")
    @Column(name = "browser_id", nullable = false, unique = true, length = 36)
    private String browserId;

    @Column(name = "total_games_played", nullable = false)
    private Integer totalGamesPlayed = 0;

    @Column(name = "total_games_won", nullable = false)
    private Integer totalGamesWon = 0;

    @Column(name = "total_guesses_in_wins", nullable = false)
    private Integer totalGuessesInWins = 0;

    @Column(name = "best_guesses")
    private Integer bestGuesses;

    @Column(name = "current_win_streak", nullable = false)
    private Integer currentWinStreak = 0;

    @Column(name = "best_win_streak", nullable = false)
    private Integer bestWinStreak = 0;

    @Column(name = "last_session_id", length = 64)
    private String lastSessionId;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public NumberNinjaRecord() {
    }

    public NumberNinjaRecord(String browserId) {
        this.browserId = browserId;
        this.totalGamesPlayed = 0;
        this.totalGamesWon = 0;
        this.totalGuessesInWins = 0;
        this.currentWinStreak = 0;
        this.bestWinStreak = 0;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.totalGamesPlayed == null) this.totalGamesPlayed = 0;
        if (this.totalGamesWon == null) this.totalGamesWon = 0;
        if (this.totalGuessesInWins == null) this.totalGuessesInWins = 0;
        if (this.currentWinStreak == null) this.currentWinStreak = 0;
        if (this.bestWinStreak == null) this.bestWinStreak = 0;
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

    public String getLastSessionId() {
        return lastSessionId;
    }

    public void setLastSessionId(String lastSessionId) {
        this.lastSessionId = lastSessionId;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
