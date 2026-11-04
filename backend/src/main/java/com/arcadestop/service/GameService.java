package com.arcadestop.service;

import com.arcadestop.dto.GameResponseDto;
import com.arcadestop.entity.Game;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.GameRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class GameService {

    private final GameRepository gameRepository;

    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Transactional(readOnly = true)
    public List<GameResponseDto> getAllGames() {
        return gameRepository.findAllByOrderByIdAsc()
                .stream()
                .map(GameResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public GameResponseDto getGameBySlug(String slug) {
        Game game = gameRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Game not found with slug: " + slug));
        return GameResponseDto.fromEntity(game);
    }

    @Transactional(readOnly = true)
    public List<GameResponseDto> getGamesByCategory(String category) {
        return gameRepository.findByCategoryIgnoreCase(category)
                .stream()
                .map(GameResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}
