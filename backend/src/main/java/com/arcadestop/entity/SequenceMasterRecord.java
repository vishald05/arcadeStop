package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "sequence_master_records", uniqueConstraints = {
    @UniqueConstraint(name = "uk_seq_master_browser_diff", columnNames = {"browser_id", "difficulty"})
})
public class SequenceMasterRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Browser ID is required")
    @Column(name = "browser_id", nullable = false, length = 36)
    private String browserId;

    @NotBlank(message = "Difficulty is required")
    @Column(name = "difficulty", nullable = false, length = 16)
    private String difficulty;

    @Column(name = "total_games_played", nullable = false)
    private Integer totalGamesPlayed = 0;

    @Column(name = "highest_score", nullable = false)
    private Integer highestScore = 0;

    @Column(name = "total_score_sum", nullable = false)
    private Long totalScoreSum = 0L;

    @Column(name = "highest_sequence_length", nullable = false)
    private Integer highestSequenceLength = 0;

    @Column(name = "total_sequence_length_sum", nullable = false)
    private Long totalSequenceLengthSum = 0L;

    @Column(name = "total_completed_rounds", nullable = false)
    private Long totalCompletedRounds = 0L;

    @Column(name = "total_correct_tile_inputs", nullable = false)
    private Long totalCorrectTileInputs = 0L;

    @Column(name = "last_session_id", length = 64)
    private String lastSessionId;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public SequenceMasterRecord() {
    }

    public SequenceMasterRecord(String browserId, String difficulty) {
        this.browserId = browserId;
        this.difficulty = difficulty;
        this.totalGamesPlayed = 0;
        this.highestScore = 0;
        this.totalScoreSum = 0L;
        this.highestSequenceLength = 0;
        this.totalSequenceLengthSum = 0L;
        this.totalCompletedRounds = 0L;
        this.totalCorrectTileInputs = 0L;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.totalGamesPlayed == null) this.totalGamesPlayed = 0;
        if (this.highestScore == null) this.highestScore = 0;
        if (this.totalScoreSum == null) this.totalScoreSum = 0L;
        if (this.highestSequenceLength == null) this.highestSequenceLength = 0;
        if (this.totalSequenceLengthSum == null) this.totalSequenceLengthSum = 0L;
        if (this.totalCompletedRounds == null) this.totalCompletedRounds = 0L;
        if (this.totalCorrectTileInputs == null) this.totalCorrectTileInputs = 0L;
    }

    public Double getAverageScore() {
        if (totalGamesPlayed == null || totalGamesPlayed == 0) {
            return 0.0;
        }
        double avg = (double) totalScoreSum / totalGamesPlayed;
        return Math.round(avg * 10.0) / 10.0;
    }

    public Double getAverageSequenceLength() {
        if (totalGamesPlayed == null || totalGamesPlayed == 0) {
            return 0.0;
        }
        double avg = (double) totalSequenceLengthSum / totalGamesPlayed;
        return Math.round(avg * 10.0) / 10.0;
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

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getTotalGamesPlayed() {
        return totalGamesPlayed;
    }

    public void setTotalGamesPlayed(Integer totalGamesPlayed) {
        this.totalGamesPlayed = totalGamesPlayed;
    }

    public Integer getHighestScore() {
        return highestScore;
    }

    public void setHighestScore(Integer highestScore) {
        this.highestScore = highestScore;
    }

    public Long getTotalScoreSum() {
        return totalScoreSum;
    }

    public void setTotalScoreSum(Long totalScoreSum) {
        this.totalScoreSum = totalScoreSum;
    }

    public Integer getHighestSequenceLength() {
        return highestSequenceLength;
    }

    public void setHighestSequenceLength(Integer highestSequenceLength) {
        this.highestSequenceLength = highestSequenceLength;
    }

    public Long getTotalSequenceLengthSum() {
        return totalSequenceLengthSum;
    }

    public void setTotalSequenceLengthSum(Long totalSequenceLengthSum) {
        this.totalSequenceLengthSum = totalSequenceLengthSum;
    }

    public Long getTotalCompletedRounds() {
        return totalCompletedRounds;
    }

    public void setTotalCompletedRounds(Long totalCompletedRounds) {
        this.totalCompletedRounds = totalCompletedRounds;
    }

    public Long getTotalCorrectTileInputs() {
        return totalCorrectTileInputs;
    }

    public void setTotalCorrectTileInputs(Long totalCorrectTileInputs) {
        this.totalCorrectTileInputs = totalCorrectTileInputs;
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
