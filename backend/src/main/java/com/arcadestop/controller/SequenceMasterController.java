package com.arcadestop.controller;

import com.arcadestop.dto.PagedResponseDto;
import com.arcadestop.dto.SequenceMasterOverviewDto;
import com.arcadestop.dto.SequenceMasterRecordDto;
import com.arcadestop.dto.SequenceMasterSessionDto;
import com.arcadestop.dto.SequenceMasterSessionRequestDto;
import com.arcadestop.service.SequenceMasterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sequence-master")
public class SequenceMasterController {

    private final SequenceMasterService sequenceMasterService;

    public SequenceMasterController(SequenceMasterService sequenceMasterService) {
        this.sequenceMasterService = sequenceMasterService;
    }

    @GetMapping("/records/{browserId}")
    public ResponseEntity<SequenceMasterOverviewDto> getOverview(@PathVariable String browserId) {
        return ResponseEntity.ok(sequenceMasterService.getOverview(browserId));
    }

    @GetMapping("/records/{browserId}/sessions")
    public ResponseEntity<PagedResponseDto<SequenceMasterSessionDto>> getSessionHistory(
            @PathVariable String browserId,
            @RequestParam(required = false) String difficulty,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(sequenceMasterService.getSessionHistory(browserId, difficulty, page, size));
    }

    @GetMapping("/records/{browserId}/{difficulty}")
    public ResponseEntity<SequenceMasterRecordDto> getRecord(
            @PathVariable String browserId,
            @PathVariable String difficulty) {
        return ResponseEntity.ok(sequenceMasterService.getRecord(browserId, difficulty));
    }

    @PostMapping("/records/{browserId}")
    public ResponseEntity<SequenceMasterRecordDto> submitSession(
            @PathVariable String browserId,
            @Valid @RequestBody SequenceMasterSessionRequestDto request) {
        return ResponseEntity.ok(sequenceMasterService.submitSession(browserId, request));
    }
}
