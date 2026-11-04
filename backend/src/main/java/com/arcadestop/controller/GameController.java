package com.arcadestop.controller;

import com.arcadestop.dto.GameResponseDto;
import com.arcadestop.service.GameService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
public class GameController {

    private final GameService gameService;

    public GameController(GameService gameService) {
        this.gameService = gameService;
    }

    @GetMapping
    public ResponseEntity<List<GameResponseDto>> getAllGames() {
        return ResponseEntity.ok(gameService.getAllGames());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<GameResponseDto> getGameBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(gameService.getGameBySlug(slug));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<GameResponseDto>> getGamesByCategory(@PathVariable String category) {
        return ResponseEntity.ok(gameService.getGamesByCategory(category));
    }
}
