package com.arcadestop.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public class ReactionRushSessionRequestDto {

    @NotNull(message = "Reaction times are required")
    @Size(min = 5, max = 5, message = "Exactly 5 reaction times are required")
    private List<Integer> reactionTimes;

    public ReactionRushSessionRequestDto() {
    }

    public ReactionRushSessionRequestDto(List<Integer> reactionTimes) {
        this.reactionTimes = reactionTimes;
    }

    public List<Integer> getReactionTimes() {
        return reactionTimes;
    }

    public void setReactionTimes(List<Integer> reactionTimes) {
        this.reactionTimes = reactionTimes;
    }
}
