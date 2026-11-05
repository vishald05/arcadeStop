package com.arcadestop.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "reaction_rush_records", uniqueConstraints = {
    @UniqueConstraint(name = "uk_reaction_rush_browser_id", columnNames = "browser_id")
})
public class ReactionRushRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Browser ID is required")
    @Column(name = "browser_id", nullable = false, unique = true, length = 36)
    private String browserId;

    @Column(name = "best_reaction_ms", nullable = false)
    private Integer bestReactionMs;

    @Column(name = "average_reaction_ms", nullable = false)
    private Integer averageReactionMs;

    @Column(name = "total_sessions", nullable = false)
    private Integer totalSessions = 0;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ReactionRushRecord() {
    }

    public ReactionRushRecord(String browserId, Integer bestReactionMs, Integer averageReactionMs, Integer totalSessions) {
        this.browserId = browserId;
        this.bestReactionMs = bestReactionMs;
        this.averageReactionMs = averageReactionMs;
        this.totalSessions = totalSessions != null ? totalSessions : 0;
        this.updatedAt = LocalDateTime.now();
    }

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
        if (this.totalSessions == null) {
            this.totalSessions = 0;
        }
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
}
