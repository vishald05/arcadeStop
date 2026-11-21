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
    @DisplayName("Fresh database initialization seeds all 6 games with Reaction Rush, Number Ninja, and TypeStorm as AVAILABLE")
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

        Game typeStorm = savedGames.stream()
                .filter(g -> g.getSlug().equals("type-storm"))
                .findFirst()
                .orElseThrow();
        assertThat(typeStorm.getStatus()).isEqualTo(GameStatus.AVAILABLE);
        assertThat(typeStorm.getCategory()).isEqualTo("Typing");

        Game whackAttack = savedGames.stream()
                .filter(g -> g.getSlug().equals("whack-attack"))
                .findFirst()
                .orElseThrow();
        assertThat(whackAttack.getStatus()).isEqualTo(GameStatus.AVAILABLE);
        assertThat(whackAttack.getCategory()).isEqualTo("Reflex");

        Game sequenceMaster = savedGames.stream()
                .filter(g -> g.getSlug().equals("sequence-master"))
                .findFirst()
                .orElseThrow();
        assertThat(sequenceMaster.getStatus()).isEqualTo(GameStatus.AVAILABLE);
        assertThat(sequenceMaster.getCategory()).isEqualTo("Memory");

        Game memoryMadness = savedGames.stream()
                .filter(g -> g.getSlug().equals("memory-madness"))
                .findFirst()
                .orElseThrow();
        assertThat(memoryMadness.getStatus()).isEqualTo(GameStatus.COMING_SOON);
    }

    @Test
    @DisplayName("Existing database updates TypeStorm from COMING_SOON/Skills to AVAILABLE/Typing while keeping other fields intact")
    void testExistingDatabaseUpdatesTypeStormStatus() {
        Game existingReactionRush = new Game("Reaction Rush", "reaction-rush", "Test reflexes", "Reflex", "zap", GameStatus.AVAILABLE, true);
        Game existingNumberNinja = new Game("Number Ninja", "number-ninja", "Guess number", "Puzzle", "hash", GameStatus.AVAILABLE, false);
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

        // TypeStorm, Sequence Master, and Whack Attack have status change (COMING_SOON -> AVAILABLE), so they should be saved
        verify(gameRepository, times(1)).save(existingTypeStorm);
        verify(gameRepository, times(1)).save(existingSequence);
        verify(gameRepository, times(1)).save(existingWhack);
        assertThat(existingTypeStorm.getStatus()).isEqualTo(GameStatus.AVAILABLE);
        assertThat(existingTypeStorm.getCategory()).isEqualTo("Typing");
        assertThat(existingTypeStorm.getName()).isEqualTo("TypeStorm");
        assertThat(existingSequence.getStatus()).isEqualTo(GameStatus.AVAILABLE);
        assertThat(existingWhack.getStatus()).isEqualTo(GameStatus.AVAILABLE);

        // Reaction Rush and Number Ninja were already AVAILABLE, so they were not resaved
        verify(gameRepository, never()).save(existingReactionRush);
        verify(gameRepository, never()).save(existingNumberNinja);
    }
}
