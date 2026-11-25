package com.arcadestop.controller;

import com.arcadestop.dto.PagedResponseDto;
import com.arcadestop.dto.TypeStormRecordDto;
import com.arcadestop.dto.TypeStormSessionDto;
import com.arcadestop.dto.TypeStormSessionRequestDto;
import com.arcadestop.service.TypeStormService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/type-storm")
public class TypeStormController {

    private final TypeStormService typeStormService;

    public TypeStormController(TypeStormService typeStormService) {
        this.typeStormService = typeStormService;
    }

    @GetMapping("/records/{browserId}")
    public ResponseEntity<TypeStormRecordDto> getRecord(@PathVariable String browserId) {
        return ResponseEntity.ok(typeStormService.getRecord(browserId));
    }

    @GetMapping("/records/{browserId}/sessions")
    public ResponseEntity<PagedResponseDto<TypeStormSessionDto>> getSessionHistory(
            @PathVariable String browserId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(typeStormService.getSessionHistory(browserId, page, size));
    }

    @PostMapping("/records/{browserId}")
    public ResponseEntity<TypeStormRecordDto> submitSession(
            @PathVariable String browserId,
            @Valid @RequestBody TypeStormSessionRequestDto request) {
        return ResponseEntity.ok(typeStormService.submitSession(browserId, request));
    }
}
