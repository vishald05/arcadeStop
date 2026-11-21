package com.arcadestop.dto;

import com.arcadestop.entity.MemoryMadnessRecord;
import java.time.LocalDateTime;

public class MemoryMadnessRecordDto {

    private Long id;
    private String browserId;
    private String difficulty;
    private Integer totalGamesPlayed;
    private Integer bestScore;
    private Double averageScore;
    private Double bestCompletionTime;
    private Double averageCompletionTime;
    private Integer bestMoveCount;
    private Double averageMoveCount;
    private Double bestAccuracy;
    private Double averageAccuracy;
    private Long totalPairsMatched;
    private LocalDateTime updatedAt;
    private boolean newPersonalBest;

    public MemoryMadnessRecordDto() {
    }

    public MemoryMadnessRecordDto(Long id, String browserId, String difficulty,
                                 Integer totalGamesPlayed, Integer bestScore,
                                 Double averageScore, Double bestCompletionTime,
                                 Double averageCompletionTime, Integer bestMoveCount,
                                 Double averageMoveCount, Double bestAccuracy,
                                 Double averageAccuracy, Long totalPairsMatched,
                                 LocalDateTime updatedAt, boolean newPersonalBest) {
        this.id = id;
        this.browserId = browserId;
        this.difficulty = difficulty;
        this.totalGamesPlayed = totalGamesPlayed;
        this.bestScore = bestScore;
        this.averageScore = averageScore;
        this.bestCompletionTime = bestCompletionTime;
        this.averageCompletionTime = averageCompletionTime;
        this.bestMoveCount = bestMoveCount;
        this.averageMoveCount = averageMoveCount;
        this.bestAccuracy = bestAccuracy;
        this.averageAccuracy = averageAccuracy;
        this.totalPairsMatched = totalPairsMatched;
        this.updatedAt = updatedAt;
        this.newPersonalBest = newPersonalBest;
    }

    public static MemoryMadnessRecordDto fromEntity(MemoryMadnessRecord entity, boolean newPersonalBest) {
        if (entity == null) {
            return null;
        }
        return new MemoryMadnessRecordDto(
                entity.getId(),
                entity.getBrowserId(),
                entity.getDifficulty(),
                entity.getTotalGamesPlayed(),
                entity.getBestScore(),
                entity.getAverageScore(),
                entity.getBestCompletionTime(),
                entity.getAverageCompletionTime(),
                entity.getBestMoveCount(),
                entity.getAverageMoveCount(),
                entity.getBestAccuracy(),
                entity.getAverageAccuracy(),
                entity.getTotalPairsMatched(),
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

    public Double getAverageScore() {
        return averageScore;
    }

    public void setAverageScore(Double averageScore) {
        this.averageScore = averageScore;
    }

    public Double getBestCompletionTime() {
        return bestCompletionTime;
    }

    public void setBestCompletionTime(Double bestCompletionTime) {
        this.bestCompletionTime = bestCompletionTime;
    }

    public Double getAverageCompletionTime() {
        return averageCompletionTime;
    }

    public void setAverageCompletionTime(Double averageCompletionTime) {
        this.averageCompletionTime = averageCompletionTime;
    }

    public Integer getBestMoveCount() {
        return bestMoveCount;
    }

    public void setBestMoveCount(Integer bestMoveCount) {
        this.bestMoveCount = bestMoveCount;
    }

    public Double getAverageMoveCount() {
        return averageMoveCount;
    }

    public void setAverageMoveCount(Double averageMoveCount) {
        this.averageMoveCount = averageMoveCount;
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

    public Long getTotalPairsMatched() {
        return totalPairsMatched;
    }

    public void setTotalPairsMatched(Long totalPairsMatched) {
        this.totalPairsMatched = totalPairsMatched;
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
