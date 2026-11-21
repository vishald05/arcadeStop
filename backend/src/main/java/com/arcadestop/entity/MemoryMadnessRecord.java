package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "memory_madness_records", uniqueConstraints = {
    @UniqueConstraint(name = "uk_mem_madness_browser_diff", columnNames = {"browser_id", "difficulty"})
})
public class MemoryMadnessRecord {

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

    @Column(name = "best_score", nullable = false)
    private Integer bestScore = 0;

    @Column(name = "total_score_sum", nullable = false)
    private Long totalScoreSum = 0L;

    @Column(name = "best_completion_time")
    private Double bestCompletionTime;

    @Column(name = "total_completion_time_sum", nullable = false)
    private Double totalCompletionTimeSum = 0.0;

    @Column(name = "best_move_count")
    private Integer bestMoveCount;

    @Column(name = "total_move_count_sum", nullable = false)
    private Long totalMoveCountSum = 0L;

    @Column(name = "best_accuracy", nullable = false)
    private Double bestAccuracy = 0.0;

    @Column(name = "total_accuracy_sum", nullable = false)
    private Double totalAccuracySum = 0.0;

    @Column(name = "total_pairs_matched", nullable = false)
    private Long totalPairsMatched = 0L;

    @Column(name = "last_session_id", length = 64)
    private String lastSessionId;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public MemoryMadnessRecord() {
    }

    public MemoryMadnessRecord(String browserId, String difficulty) {
        this.browserId = browserId;
        this.difficulty = difficulty;
        this.totalGamesPlayed = 0;
        this.bestScore = 0;
        this.totalScoreSum = 0L;
        this.totalCompletionTimeSum = 0.0;
        this.totalMoveCountSum = 0L;
        this.bestAccuracy = 0.0;
        this.totalAccuracySum = 0.0;
        this.totalPairsMatched = 0L;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.totalGamesPlayed == null) this.totalGamesPlayed = 0;
        if (this.bestScore == null) this.bestScore = 0;
        if (this.totalScoreSum == null) this.totalScoreSum = 0L;
        if (this.totalCompletionTimeSum == null) this.totalCompletionTimeSum = 0.0;
        if (this.totalMoveCountSum == null) this.totalMoveCountSum = 0L;
        if (this.bestAccuracy == null) this.bestAccuracy = 0.0;
        if (this.totalAccuracySum == null) this.totalAccuracySum = 0.0;
        if (this.totalPairsMatched == null) this.totalPairsMatched = 0L;
    }

    public Double getAverageScore() {
        if (totalGamesPlayed == null || totalGamesPlayed == 0) {
            return 0.0;
        }
        double avg = (double) totalScoreSum / totalGamesPlayed;
        return Math.round(avg * 10.0) / 10.0;
    }

    public Double getAverageCompletionTime() {
        if (totalGamesPlayed == null || totalGamesPlayed == 0) {
            return 0.0;
        }
        double avg = totalCompletionTimeSum / totalGamesPlayed;
        return Math.round(avg * 10.0) / 10.0;
    }

    public Double getAverageMoveCount() {
        if (totalGamesPlayed == null || totalGamesPlayed == 0) {
            return 0.0;
        }
        double avg = (double) totalMoveCountSum / totalGamesPlayed;
        return Math.round(avg * 10.0) / 10.0;
    }

    public Double getAverageAccuracy() {
        if (totalGamesPlayed == null || totalGamesPlayed == 0) {
            return 0.0;
        }
        double avg = totalAccuracySum / totalGamesPlayed;
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

    public Integer getBestScore() {
        return bestScore;
    }

    public void setBestScore(Integer bestScore) {
        this.bestScore = bestScore;
    }

    public Long getTotalScoreSum() {
        return totalScoreSum;
    }

    public void setTotalScoreSum(Long totalScoreSum) {
        this.totalScoreSum = totalScoreSum;
    }

    public Double getBestCompletionTime() {
        return bestCompletionTime;
    }

    public void setBestCompletionTime(Double bestCompletionTime) {
        this.bestCompletionTime = bestCompletionTime;
    }

    public Double getTotalCompletionTimeSum() {
        return totalCompletionTimeSum;
    }

    public void setTotalCompletionTimeSum(Double totalCompletionTimeSum) {
        this.totalCompletionTimeSum = totalCompletionTimeSum;
    }

    public Integer getBestMoveCount() {
        return bestMoveCount;
    }

    public void setBestMoveCount(Integer bestMoveCount) {
        this.bestMoveCount = bestMoveCount;
    }

    public Long getTotalMoveCountSum() {
        return totalMoveCountSum;
    }

    public void setTotalMoveCountSum(Long totalMoveCountSum) {
        this.totalMoveCountSum = totalMoveCountSum;
    }

    public Double getBestAccuracy() {
        return bestAccuracy;
    }

    public void setBestAccuracy(Double bestAccuracy) {
        this.bestAccuracy = bestAccuracy;
    }

    public Double getTotalAccuracySum() {
        return totalAccuracySum;
    }

    public void setTotalAccuracySum(Double totalAccuracySum) {
        this.totalAccuracySum = totalAccuracySum;
    }

    public Long getTotalPairsMatched() {
        return totalPairsMatched;
    }

    public void setTotalPairsMatched(Long totalPairsMatched) {
        this.totalPairsMatched = totalPairsMatched;
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
