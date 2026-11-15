package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "type_storm_records", uniqueConstraints = {
    @UniqueConstraint(name = "uk_type_storm_browser_id", columnNames = "browser_id")
})
public class TypeStormRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Browser ID is required")
    @Column(name = "browser_id", nullable = false, unique = true, length = 36)
    private String browserId;

    @Column(name = "total_games_played", nullable = false)
    private Integer totalGamesPlayed = 0;

    @Column(name = "best_wpm", nullable = false)
    private Integer bestWpm = 0;

    @Column(name = "total_wpm_sum", nullable = false)
    private Long totalWpmSum = 0L;

    @Column(name = "best_accuracy", nullable = false)
    private Double bestAccuracy = 0.0;

    @Column(name = "total_accuracy_sum", nullable = false)
    private Double totalAccuracySum = 0.0;

    @Column(name = "total_characters_typed", nullable = false)
    private Long totalCharactersTyped = 0L;

    @Column(name = "total_mistakes", nullable = false)
    private Long totalMistakes = 0L;

    @Column(name = "last_session_id", length = 64)
    private String lastSessionId;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public TypeStormRecord() {
    }

    public TypeStormRecord(String browserId) {
        this.browserId = browserId;
        this.totalGamesPlayed = 0;
        this.bestWpm = 0;
        this.totalWpmSum = 0L;
        this.bestAccuracy = 0.0;
        this.totalAccuracySum = 0.0;
        this.totalCharactersTyped = 0L;
        this.totalMistakes = 0L;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.totalGamesPlayed == null) this.totalGamesPlayed = 0;
        if (this.bestWpm == null) this.bestWpm = 0;
        if (this.totalWpmSum == null) this.totalWpmSum = 0L;
        if (this.bestAccuracy == null) this.bestAccuracy = 0.0;
        if (this.totalAccuracySum == null) this.totalAccuracySum = 0.0;
        if (this.totalCharactersTyped == null) this.totalCharactersTyped = 0L;
        if (this.totalMistakes == null) this.totalMistakes = 0L;
    }

    public Double getAverageWpm() {
        if (totalGamesPlayed == null || totalGamesPlayed == 0) {
            return 0.0;
        }
        double avg = (double) totalWpmSum / totalGamesPlayed;
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

    public Integer getBestWpm() {
        return bestWpm;
    }

    public void setBestWpm(Integer bestWpm) {
        this.bestWpm = bestWpm;
    }

    public Long getTotalWpmSum() {
        return totalWpmSum;
    }

    public void setTotalWpmSum(Long totalWpmSum) {
        this.totalWpmSum = totalWpmSum;
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

    public Long getTotalCharactersTyped() {
        return totalCharactersTyped;
    }

    public void setTotalCharactersTyped(Long totalCharactersTyped) {
        this.totalCharactersTyped = totalCharactersTyped;
    }

    public Long getTotalMistakes() {
        return totalMistakes;
    }

    public void setTotalMistakes(Long totalMistakes) {
        this.totalMistakes = totalMistakes;
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
