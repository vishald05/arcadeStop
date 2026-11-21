package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "whack_attack_records", uniqueConstraints = {
    @UniqueConstraint(name = "uk_whack_attack_browser_id", columnNames = "browser_id")
})
public class WhackAttackRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Browser ID is required")
    @Column(name = "browser_id", nullable = false, unique = true, length = 36)
    private String browserId;

    @Column(name = "total_games_played", nullable = false)
    private Integer totalGamesPlayed = 0;

    @Column(name = "highest_score", nullable = false)
    private Integer highestScore = 0;

    @Column(name = "total_score_sum", nullable = false)
    private Long totalScoreSum = 0L;

    @Column(name = "total_hits", nullable = false)
    private Long totalHits = 0L;

    @Column(name = "best_accuracy", nullable = false)
    private Double bestAccuracy = 0.0;

    @Column(name = "total_accuracy_sum", nullable = false)
    private Double totalAccuracySum = 0.0;

    @Column(name = "best_combo", nullable = false)
    private Integer bestCombo = 0;

    @Column(name = "total_missed_targets", nullable = false)
    private Long totalMissedTargets = 0L;

    @Column(name = "total_empty_clicks", nullable = false)
    private Long totalEmptyClicks = 0L;

    @Column(name = "last_session_id", length = 64)
    private String lastSessionId;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public WhackAttackRecord() {
    }

    public WhackAttackRecord(String browserId) {
        this.browserId = browserId;
        this.totalGamesPlayed = 0;
        this.highestScore = 0;
        this.totalScoreSum = 0L;
        this.totalHits = 0L;
        this.bestAccuracy = 0.0;
        this.totalAccuracySum = 0.0;
        this.bestCombo = 0;
        this.totalMissedTargets = 0L;
        this.totalEmptyClicks = 0L;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.totalGamesPlayed == null) this.totalGamesPlayed = 0;
        if (this.highestScore == null) this.highestScore = 0;
        if (this.totalScoreSum == null) this.totalScoreSum = 0L;
        if (this.totalHits == null) this.totalHits = 0L;
        if (this.bestAccuracy == null) this.bestAccuracy = 0.0;
        if (this.totalAccuracySum == null) this.totalAccuracySum = 0.0;
        if (this.bestCombo == null) this.bestCombo = 0;
        if (this.totalMissedTargets == null) this.totalMissedTargets = 0L;
        if (this.totalEmptyClicks == null) this.totalEmptyClicks = 0L;
    }

    public Double getAverageScore() {
        if (totalGamesPlayed == null || totalGamesPlayed == 0) {
            return 0.0;
        }
        double avg = (double) totalScoreSum / totalGamesPlayed;
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

    public Long getTotalHits() {
        return totalHits;
    }

    public void setTotalHits(Long totalHits) {
        this.totalHits = totalHits;
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

    public Integer getBestCombo() {
        return bestCombo;
    }

    public void setBestCombo(Integer bestCombo) {
        this.bestCombo = bestCombo;
    }

    public Long getTotalMissedTargets() {
        return totalMissedTargets;
    }

    public void setTotalMissedTargets(Long totalMissedTargets) {
        this.totalMissedTargets = totalMissedTargets;
    }

    public Long getTotalEmptyClicks() {
        return totalEmptyClicks;
    }

    public void setTotalEmptyClicks(Long totalEmptyClicks) {
        this.totalEmptyClicks = totalEmptyClicks;
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
