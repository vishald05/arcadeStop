package com.arcadestop.controller;

import com.arcadestop.dto.PagedResponseDto;
import com.arcadestop.dto.WhackAttackRecordDto;
import com.arcadestop.dto.WhackAttackSessionDto;
import com.arcadestop.dto.WhackAttackSessionRequestDto;
import com.arcadestop.service.WhackAttackService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/whack-attack")
public class WhackAttackController {

    private final WhackAttackService whackAttackService;

    public WhackAttackController(WhackAttackService whackAttackService) {
        this.whackAttackService = whackAttackService;
    }

    @GetMapping("/records/{browserId}")
    public ResponseEntity<WhackAttackRecordDto> getRecord(@PathVariable String browserId) {
        return ResponseEntity.ok(whackAttackService.getRecord(browserId));
    }

    @GetMapping("/records/{browserId}/sessions")
    public ResponseEntity<PagedResponseDto<WhackAttackSessionDto>> getSessionHistory(
            @PathVariable String browserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(whackAttackService.getSessionHistory(browserId, page, size));
    }

    @PostMapping("/records/{browserId}")
    public ResponseEntity<WhackAttackRecordDto> submitSession(
            @PathVariable String browserId,
            @Valid @RequestBody WhackAttackSessionRequestDto request) {
        return ResponseEntity.ok(whackAttackService.submitSession(browserId, request));
    }
}
