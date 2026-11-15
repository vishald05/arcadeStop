package com.arcadestop.dto;

import com.arcadestop.entity.TypeStormRecord;
import java.time.LocalDateTime;

public class TypeStormRecordDto {

    private Long id;
    private String browserId;
    private Integer totalGamesPlayed;
    private Integer bestWpm;
    private Double averageWpm;
    private Double bestAccuracy;
    private Double averageAccuracy;
    private Long totalCharactersTyped;
    private Long totalMistakes;
    private LocalDateTime updatedAt;
    private boolean newPersonalBest;

    public TypeStormRecordDto() {
    }

    public TypeStormRecordDto(Long id, String browserId, Integer totalGamesPlayed,
                             Integer bestWpm, Double averageWpm, Double bestAccuracy,
                             Double averageAccuracy, Long totalCharactersTyped,
                             Long totalMistakes, LocalDateTime updatedAt,
                             boolean newPersonalBest) {
        this.id = id;
        this.browserId = browserId;
        this.totalGamesPlayed = totalGamesPlayed;
        this.bestWpm = bestWpm;
        this.averageWpm = averageWpm;
        this.bestAccuracy = bestAccuracy;
        this.averageAccuracy = averageAccuracy;
        this.totalCharactersTyped = totalCharactersTyped;
        this.totalMistakes = totalMistakes;
        this.updatedAt = updatedAt;
        this.newPersonalBest = newPersonalBest;
    }

    public static TypeStormRecordDto fromEntity(TypeStormRecord entity, boolean newPersonalBest) {
        return new TypeStormRecordDto(
                entity.getId(),
                entity.getBrowserId(),
                entity.getTotalGamesPlayed(),
                entity.getBestWpm(),
                entity.getAverageWpm(),
                entity.getBestAccuracy(),
                entity.getAverageAccuracy(),
                entity.getTotalCharactersTyped(),
                entity.getTotalMistakes(),
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

    public Integer getBestWpm() {
        return bestWpm;
    }

    public void setBestWpm(Integer bestWpm) {
        this.bestWpm = bestWpm;
    }

    public Double getAverageWpm() {
        return averageWpm;
    }

    public void setAverageWpm(Double averageWpm) {
        this.averageWpm = averageWpm;
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
