package com.arcadestop.controller;

import com.arcadestop.dto.NumberNinjaRecordDto;
import com.arcadestop.dto.NumberNinjaSessionRequestDto;
import com.arcadestop.service.NumberNinjaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/number-ninja")
public class NumberNinjaController {

    private final NumberNinjaService numberNinjaService;

    public NumberNinjaController(NumberNinjaService numberNinjaService) {
        this.numberNinjaService = numberNinjaService;
    }

    @GetMapping("/records/{browserId}")
    public ResponseEntity<NumberNinjaRecordDto> getRecord(@PathVariable String browserId) {
        return ResponseEntity.ok(numberNinjaService.getRecord(browserId));
    }

    @PostMapping("/records/{browserId}")
    public ResponseEntity<NumberNinjaRecordDto> submitSession(
            @PathVariable String browserId,
            @Valid @RequestBody NumberNinjaSessionRequestDto request) {
        return ResponseEntity.ok(numberNinjaService.submitSession(browserId, request));
    }
}
