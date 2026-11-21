package com.arcadestop.controller;

import com.arcadestop.dto.MemoryMadnessOverviewDto;
import com.arcadestop.dto.MemoryMadnessRecordDto;
import com.arcadestop.dto.MemoryMadnessSessionRequestDto;
import com.arcadestop.service.MemoryMadnessService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/memory-madness")
public class MemoryMadnessController {

    private final MemoryMadnessService memoryMadnessService;

    public MemoryMadnessController(MemoryMadnessService memoryMadnessService) {
        this.memoryMadnessService = memoryMadnessService;
    }

    @GetMapping("/records/{browserId}")
    public ResponseEntity<MemoryMadnessOverviewDto> getOverview(@PathVariable String browserId) {
        return ResponseEntity.ok(memoryMadnessService.getOverview(browserId));
    }

    @GetMapping("/records/{browserId}/{difficulty}")
    public ResponseEntity<MemoryMadnessRecordDto> getRecord(
            @PathVariable String browserId,
            @PathVariable String difficulty) {
        return ResponseEntity.ok(memoryMadnessService.getRecord(browserId, difficulty));
    }

    @PostMapping("/records/{browserId}")
    public ResponseEntity<MemoryMadnessRecordDto> submitSession(
            @PathVariable String browserId,
            @Valid @RequestBody MemoryMadnessSessionRequestDto request) {
        return ResponseEntity.ok(memoryMadnessService.submitSession(browserId, request));
    }
}
