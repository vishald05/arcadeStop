package com.arcadestop.dto;

import com.arcadestop.entity.ReactionRushRecord;
import java.time.LocalDateTime;

public class ReactionRushRecordDto {
    private Long id;
    private String browserId;
    private Integer bestReactionMs;
    private Integer averageReactionMs;
    private Integer totalSessions;
    private LocalDateTime updatedAt;
    private boolean isNewPersonalBest;

    public ReactionRushRecordDto() {
    }

    public ReactionRushRecordDto(Long id, String browserId, Integer bestReactionMs, Integer averageReactionMs, Integer totalSessions, LocalDateTime updatedAt, boolean isNewPersonalBest) {
        this.id = id;
        this.browserId = browserId;
        this.bestReactionMs = bestReactionMs;
        this.averageReactionMs = averageReactionMs;
        this.totalSessions = totalSessions;
        this.updatedAt = updatedAt;
        this.isNewPersonalBest = isNewPersonalBest;
    }

    public static ReactionRushRecordDto fromEntity(ReactionRushRecord record, boolean isNewPersonalBest) {
        if (record == null) {
            return null;
        }
        return new ReactionRushRecordDto(
            record.getId(),
            record.getBrowserId(),
            record.getBestReactionMs(),
            record.getAverageReactionMs(),
            record.getTotalSessions(),
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

    public Integer getBestReactionMs() {
        return bestReactionMs;
    }

    public void setBestReactionMs(Integer bestReactionMs) {
        this.bestReactionMs = bestReactionMs;
    }

    public Integer getAverageReactionMs() {
        return averageReactionMs;
    }

    public void setAverageReactionMs(Integer averageReactionMs) {
        this.averageReactionMs = averageReactionMs;
    }

    public Integer getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(Integer totalSessions) {
        this.totalSessions = totalSessions;
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
