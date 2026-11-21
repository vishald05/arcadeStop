package com.arcadestop.dto;

import com.arcadestop.entity.WhackAttackRecord;
import java.time.LocalDateTime;

public class WhackAttackRecordDto {

    private Long id;
    private String browserId;
    private Integer totalGamesPlayed;
    private Integer highestScore;
    private Double averageScore;
    private Long totalHits;
    private Double bestAccuracy;
    private Double averageAccuracy;
    private Integer bestCombo;
    private Long totalMissedTargets;
    private Long totalEmptyClicks;
    private LocalDateTime updatedAt;
    private boolean newPersonalBest;

    public WhackAttackRecordDto() {
    }

    public WhackAttackRecordDto(Long id, String browserId, Integer totalGamesPlayed,
                               Integer highestScore, Double averageScore, Long totalHits,
                               Double bestAccuracy, Double averageAccuracy, Integer bestCombo,
                               Long totalMissedTargets, Long totalEmptyClicks,
                               LocalDateTime updatedAt, boolean newPersonalBest) {
        this.id = id;
        this.browserId = browserId;
        this.totalGamesPlayed = totalGamesPlayed;
        this.highestScore = highestScore;
        this.averageScore = averageScore;
        this.totalHits = totalHits;
        this.bestAccuracy = bestAccuracy;
        this.averageAccuracy = averageAccuracy;
        this.bestCombo = bestCombo;
        this.totalMissedTargets = totalMissedTargets;
        this.totalEmptyClicks = totalEmptyClicks;
        this.updatedAt = updatedAt;
        this.newPersonalBest = newPersonalBest;
    }

    public static WhackAttackRecordDto fromEntity(WhackAttackRecord entity, boolean newPersonalBest) {
        if (entity == null) {
            return null;
        }
        return new WhackAttackRecordDto(
                entity.getId(),
                entity.getBrowserId(),
                entity.getTotalGamesPlayed(),
                entity.getHighestScore(),
                entity.getAverageScore(),
                entity.getTotalHits(),
                entity.getBestAccuracy(),
                entity.getAverageAccuracy(),
                entity.getBestCombo(),
                entity.getTotalMissedTargets(),
                entity.getTotalEmptyClicks(),
                entity.getUpdatedAt(),
                newPersonalBest
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

    public Integer getHighestScore() {
        return highestScore;
    }

    public void setHighestScore(Integer highestScore) {
        this.highestScore = highestScore;
    }

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
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

    public Double getAverageAccuracy() {
        return averageAccuracy;
    }

    public void setAverageAccuracy(Double averageAccuracy) {
        this.averageAccuracy = averageAccuracy;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isNewPersonalBest() {
        return newPersonalBest;
    }

    public void setNewPersonalBest(boolean newPersonalBest) {
        this.newPersonalBest = newPersonalBest;
    }
}
