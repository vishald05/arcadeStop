package com.arcadestop.service;

import com.arcadestop.dto.GameResponseDto;
import com.arcadestop.entity.Game;
import com.arcadestop.entity.GameStatus;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.GameRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private GameService gameService;

    private Game testGame;

    @BeforeEach
    void setUp() {
        testGame = new Game(
                "Reaction Rush",
                "reaction-rush",
                "Test reflexes",
                "Reflex",
                "zap",
                GameStatus.COMING_SOON,
                true
        );
        testGame.setId(1L);
    }

    @Test
    @DisplayName("getAllGames should return list of GameResponseDto")
    void testGetAllGames() {
        when(gameRepository.findAllByOrderByIdAsc()).thenReturn(List.of(testGame));

        List<GameResponseDto> games = gameService.getAllGames();

        assertThat(games).hasSize(1);
        assertThat(games.get(0).getName()).isEqualTo("Reaction Rush");
        assertThat(games.get(0).getSlug()).isEqualTo("reaction-rush");
        verify(gameRepository, times(1)).findAllByOrderByIdAsc();
    }

    @Test
    @DisplayName("getGameBySlug should return game when slug exists")
    void testGetGameBySlugSuccess() {
        when(gameRepository.findBySlug("reaction-rush")).thenReturn(Optional.of(testGame));

        GameResponseDto dto = gameService.getGameBySlug("reaction-rush");

        assertThat(dto).isNotNull();
        assertThat(dto.getSlug()).isEqualTo("reaction-rush");
        assertThat(dto.getFeatured()).isTrue();
        verify(gameRepository, times(1)).findBySlug("reaction-rush");
    }

    @Test
    @DisplayName("getGameBySlug should throw ResourceNotFoundException when slug does not exist")
    void testGetGameBySlugNotFound() {
        when(gameRepository.findBySlug("unknown-game")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> gameService.getGameBySlug("unknown-game"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Game not found with slug: unknown-game");

        verify(gameRepository, times(1)).findBySlug("unknown-game");
    }

    @Test
    @DisplayName("getGamesByCategory should return filtered games")
    void testGetGamesByCategory() {
        when(gameRepository.findByCategoryIgnoreCase("Reflex")).thenReturn(List.of(testGame));

        List<GameResponseDto> reflexGames = gameService.getGamesByCategory("Reflex");

        assertThat(reflexGames).hasSize(1);
        assertThat(reflexGames.get(0).getCategory()).isEqualTo("Reflex");
        verify(gameRepository, times(1)).findByCategoryIgnoreCase("Reflex");
    }
}
