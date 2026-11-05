package com.arcadestop.controller;

import com.arcadestop.dto.ReactionRushRecordDto;
import com.arcadestop.dto.ReactionRushSessionRequestDto;
import com.arcadestop.service.ReactionRushService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reaction-rush")
public class ReactionRushController {

    private final ReactionRushService reactionRushService;

    public ReactionRushController(ReactionRushService reactionRushService) {
        this.reactionRushService = reactionRushService;
    }

    @GetMapping("/records/{browserId}")
    public ResponseEntity<ReactionRushRecordDto> getRecord(@PathVariable String browserId) {
        return ResponseEntity.ok(reactionRushService.getRecord(browserId));
    }

    @PostMapping("/records/{browserId}")
    public ResponseEntity<ReactionRushRecordDto> submitSession(
            @PathVariable String browserId,
            @Valid @RequestBody ReactionRushSessionRequestDto request) {
        return ResponseEntity.ok(reactionRushService.submitSession(browserId, request));
    }
}
