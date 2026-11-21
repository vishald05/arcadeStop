package com.arcadestop.dto;

import com.arcadestop.entity.SequenceMasterRecord;
import java.time.LocalDateTime;

public class SequenceMasterRecordDto {

    private Long id;
    private String browserId;
    private String difficulty;
    private Integer totalGamesPlayed;
    private Integer highestScore;
    private Double averageScore;
    private Integer highestSequenceLength;
    private Double averageSequenceLength;
    private Long totalCompletedRounds;
    private Long totalCorrectTileInputs;
    private LocalDateTime updatedAt;
    private boolean newPersonalBest;

    public SequenceMasterRecordDto() {
    }

    public SequenceMasterRecordDto(Long id, String browserId, String difficulty,
                                  Integer totalGamesPlayed, Integer highestScore,
                                  Double averageScore, Integer highestSequenceLength,
                                  Double averageSequenceLength, Long totalCompletedRounds,
                                  Long totalCorrectTileInputs, LocalDateTime updatedAt,
                                  boolean newPersonalBest) {
        this.id = id;
        this.browserId = browserId;
        this.difficulty = difficulty;
        this.totalGamesPlayed = totalGamesPlayed;
        this.highestScore = highestScore;
        this.averageScore = averageScore;
        this.highestSequenceLength = highestSequenceLength;
        this.averageSequenceLength = averageSequenceLength;
        this.totalCompletedRounds = totalCompletedRounds;
        this.totalCorrectTileInputs = totalCorrectTileInputs;
        this.updatedAt = updatedAt;
        this.newPersonalBest = newPersonalBest;
    }

    public static SequenceMasterRecordDto fromEntity(SequenceMasterRecord entity, boolean newPersonalBest) {
        if (entity == null) {
            return null;
        }
        return new SequenceMasterRecordDto(
                entity.getId(),
                entity.getBrowserId(),
                entity.getDifficulty(),
                entity.getTotalGamesPlayed(),
                entity.getHighestScore(),
                entity.getAverageScore(),
                entity.getHighestSequenceLength(),
                entity.getAverageSequenceLength(),
                entity.getTotalCompletedRounds(),
                entity.getTotalCorrectTileInputs(),
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

    public Integer getHighestSequenceLength() {
        return highestSequenceLength;
    }

    public void setHighestSequenceLength(Integer highestSequenceLength) {
        this.highestSequenceLength = highestSequenceLength;
    }

    public Double getAverageSequenceLength() {
        return averageSequenceLength;
    }

    public void setAverageSequenceLength(Double averageSequenceLength) {
        this.averageSequenceLength = averageSequenceLength;
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
