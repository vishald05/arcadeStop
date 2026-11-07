package com.arcadestop.config;

import com.arcadestop.entity.Game;
import com.arcadestop.entity.GameStatus;
import com.arcadestop.repository.GameRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private DataInitializer dataInitializer;

    @Test
    @DisplayName("Fresh database initialization seeds all 6 games with Reaction Rush and Number Ninja as AVAILABLE")
    void testFreshDatabaseInitialization() {
        when(gameRepository.findBySlug(anyString())).thenReturn(Optional.empty());

        dataInitializer.run();

        // 6 games should be saved
        ArgumentCaptor<Game> captor = ArgumentCaptor.forClass(Game.class);
        verify(gameRepository, times(6)).save(captor.capture());

        var savedGames = captor.getAllValues();
        assertThat(savedGames).hasSize(6);

        Game reactionRush = savedGames.stream()
                .filter(g -> g.getSlug().equals("reaction-rush"))
                .findFirst()
                .orElseThrow();
        assertThat(reactionRush.getStatus()).isEqualTo(GameStatus.AVAILABLE);

        Game numberNinja = savedGames.stream()
                .filter(g -> g.getSlug().equals("number-ninja"))
                .findFirst()
                .orElseThrow();
        assertThat(numberNinja.getStatus()).isEqualTo(GameStatus.AVAILABLE);

        Game memoryMadness = savedGames.stream()
                .filter(g -> g.getSlug().equals("memory-madness"))
                .findFirst()
                .orElseThrow();
        assertThat(memoryMadness.getStatus()).isEqualTo(GameStatus.COMING_SOON);
    }

    @Test
    @DisplayName("Existing database updates Number Ninja from COMING_SOON to AVAILABLE while keeping Reaction Rush AVAILABLE and other fields intact")
    void testExistingDatabaseUpdatesNumberNinjaStatus() {
        Game existingReactionRush = new Game("Reaction Rush", "reaction-rush", "Test reflexes", "Reflex", "zap", GameStatus.AVAILABLE, true);
        Game existingNumberNinja = new Game("Number Ninja", "number-ninja", "Guess number", "Puzzle", "hash", GameStatus.COMING_SOON, false);
        Game existingMemoryMadness = new Game("Memory Madness", "memory-madness", "Memory game", "Brain", "brain", GameStatus.COMING_SOON, false);
        Game existingTypeStorm = new Game("TypeStorm", "type-storm", "Typing", "Skills", "keyboard", GameStatus.COMING_SOON, false);
        Game existingSequence = new Game("Sequence Master", "sequence-master", "Sequence", "Memory", "palette", GameStatus.COMING_SOON, false);
        Game existingWhack = new Game("Whack Attack", "whack-attack", "Whack", "Reflex", "target", GameStatus.COMING_SOON, false);

        when(gameRepository.findBySlug("reaction-rush")).thenReturn(Optional.of(existingReactionRush));
        when(gameRepository.findBySlug("number-ninja")).thenReturn(Optional.of(existingNumberNinja));
        when(gameRepository.findBySlug("memory-madness")).thenReturn(Optional.of(existingMemoryMadness));
        when(gameRepository.findBySlug("type-storm")).thenReturn(Optional.of(existingTypeStorm));
        when(gameRepository.findBySlug("sequence-master")).thenReturn(Optional.of(existingSequence));
        when(gameRepository.findBySlug("whack-attack")).thenReturn(Optional.of(existingWhack));

        dataInitializer.run();

        // Only Number Ninja has a status change (COMING_SOON -> AVAILABLE), so only 1 save should occur
        verify(gameRepository, times(1)).save(existingNumberNinja);
        assertThat(existingNumberNinja.getStatus()).isEqualTo(GameStatus.AVAILABLE);
        assertThat(existingNumberNinja.getName()).isEqualTo("Number Ninja");
        assertThat(existingNumberNinja.getDescription()).isEqualTo("Guess number");

        // Reaction Rush was already AVAILABLE, so it wasn't resaved
        verify(gameRepository, never()).save(existingReactionRush);
        assertThat(existingReactionRush.getStatus()).isEqualTo(GameStatus.AVAILABLE);
    }
}
