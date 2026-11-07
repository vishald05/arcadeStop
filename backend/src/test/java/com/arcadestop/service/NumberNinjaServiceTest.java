package com.arcadestop.service;

import com.arcadestop.dto.NumberNinjaRecordDto;
import com.arcadestop.dto.NumberNinjaSessionRequestDto;
import com.arcadestop.entity.NumberNinjaRecord;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.NumberNinjaRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NumberNinjaServiceTest {

    @Mock
    private NumberNinjaRecordRepository repository;

    @InjectMocks
    private NumberNinjaService service;

    private static final String TEST_BROWSER_ID = "00000000-0000-4000-8000-000000000001";
    private NumberNinjaRecord existingRecord;

    @BeforeEach
    void setUp() {
        existingRecord = new NumberNinjaRecord(TEST_BROWSER_ID);
        existingRecord.setId(10L);
        existingRecord.setTotalGamesPlayed(4);
        existingRecord.setTotalGamesWon(3);
        existingRecord.setTotalGuessesInWins(12); // avg = 4.0
        existingRecord.setBestGuesses(3);
        existingRecord.setCurrentWinStreak(2);
        existingRecord.setBestWinStreak(2);
        existingRecord.setLastSessionId("prev-session-123");
        existingRecord.setUpdatedAt(LocalDateTime.now().minusDays(1));
    }

    @Test
    @DisplayName("getRecord returns DTO when browserId exists")
    void testGetRecordSuccess() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.of(existingRecord));

        NumberNinjaRecordDto dto = service.getRecord(TEST_BROWSER_ID);

        assertThat(dto).isNotNull();
        assertThat(dto.getBrowserId()).isEqualTo(TEST_BROWSER_ID);
        assertThat(dto.getTotalGamesPlayed()).isEqualTo(4);
        assertThat(dto.getTotalGamesWon()).isEqualTo(3);
        assertThat(dto.getBestGuesses()).isEqualTo(3);
        assertThat(dto.getCurrentWinStreak()).isEqualTo(2);
        assertThat(dto.getBestWinStreak()).isEqualTo(2);
        assertThat(dto.getWinPercentage()).isEqualTo(75.0);
        assertThat(dto.getAverageGuessesPerWin()).isEqualTo(4.0);
        assertThat(dto.isNewPersonalBest()).isFalse();
    }

    @Test
    @DisplayName("getRecord throws ResourceNotFoundException when browserId not found")
    void testGetRecordNotFound() {
        when(repository.findByBrowserId("unknown")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getRecord("unknown"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No record found for browser ID: unknown");
    }

    @Test
    @DisplayName("submitSession creates brand new winning record")
    void testSubmitSessionNewWinningRecord() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.empty());
        when(repository.save(any(NumberNinjaRecord.class))).thenAnswer(i -> i.getArgument(0));

        NumberNinjaSessionRequestDto req = new NumberNinjaSessionRequestDto("session-1", true, 4);
        NumberNinjaRecordDto result = service.submitSession(TEST_BROWSER_ID, req);

        assertThat(result.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(result.getTotalGamesWon()).isEqualTo(1);
        assertThat(result.getTotalGuessesInWins()).isEqualTo(4);
        assertThat(result.getBestGuesses()).isEqualTo(4);
        assertThat(result.getCurrentWinStreak()).isEqualTo(1);
        assertThat(result.getBestWinStreak()).isEqualTo(1);
        assertThat(result.getWinPercentage()).isEqualTo(100.0);
        assertThat(result.getAverageGuessesPerWin()).isEqualTo(4.0);
        assertThat(result.isNewPersonalBest()).isTrue();

        ArgumentCaptor<NumberNinjaRecord> captor = ArgumentCaptor.forClass(NumberNinjaRecord.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getLastSessionId()).isEqualTo("session-1");
    }

    @Test
    @DisplayName("submitSession creates brand new losing record")
    void testSubmitSessionNewLosingRecord() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.empty());
        when(repository.save(any(NumberNinjaRecord.class))).thenAnswer(i -> i.getArgument(0));

        NumberNinjaSessionRequestDto req = new NumberNinjaSessionRequestDto("session-loss", false, 7);
        NumberNinjaRecordDto result = service.submitSession(TEST_BROWSER_ID, req);

        assertThat(result.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(result.getTotalGamesWon()).isEqualTo(0);
        assertThat(result.getTotalGuessesInWins()).isEqualTo(0);
        assertThat(result.getBestGuesses()).isNull();
        assertThat(result.getCurrentWinStreak()).isEqualTo(0);
        assertThat(result.getBestWinStreak()).isEqualTo(0);
        assertThat(result.getWinPercentage()).isEqualTo(0.0);
        assertThat(result.getAverageGuessesPerWin()).isEqualTo(0.0);
        assertThat(result.isNewPersonalBest()).isFalse();
    }

    @Test
    @DisplayName("submitSession updates existing record with new personal best and extends streak")
    void testSubmitSessionUpdateWithNewPersonalBest() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.of(existingRecord));
        when(repository.save(any(NumberNinjaRecord.class))).thenAnswer(i -> i.getArgument(0));

        // previous best was 3. New win with 2 guesses (< 3)
        NumberNinjaSessionRequestDto req = new NumberNinjaSessionRequestDto("session-win-pb", true, 2);
        NumberNinjaRecordDto result = service.submitSession(TEST_BROWSER_ID, req);

        assertThat(result.getTotalGamesPlayed()).isEqualTo(5);
        assertThat(result.getTotalGamesWon()).isEqualTo(4);
        assertThat(result.getTotalGuessesInWins()).isEqualTo(14); // 12 + 2
        assertThat(result.getBestGuesses()).isEqualTo(2); // New PB!
        assertThat(result.getCurrentWinStreak()).isEqualTo(3);
        assertThat(result.getBestWinStreak()).isEqualTo(3);
        // 4 wins / 5 played = 80.0%
        assertThat(result.getWinPercentage()).isEqualTo(80.0);
        // 14 / 4 = 3.5
        assertThat(result.getAverageGuessesPerWin()).isEqualTo(3.5);
        assertThat(result.isNewPersonalBest()).isTrue();
    }

    @Test
    @DisplayName("submitSession updates existing record when win is slower than personal best")
    void testSubmitSessionUpdateWithoutNewPersonalBest() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.of(existingRecord));
        when(repository.save(any(NumberNinjaRecord.class))).thenAnswer(i -> i.getArgument(0));

        // previous best was 3. New win with 5 guesses (> 3)
        NumberNinjaSessionRequestDto req = new NumberNinjaSessionRequestDto("session-win-slow", true, 5);
        NumberNinjaRecordDto result = service.submitSession(TEST_BROWSER_ID, req);

        assertThat(result.getBestGuesses()).isEqualTo(3); // unchanged
        assertThat(result.isNewPersonalBest()).isFalse();
        assertThat(result.getCurrentWinStreak()).isEqualTo(3);
    }

    @Test
    @DisplayName("submitSession resets current win streak on loss while preserving best win streak")
    void testSubmitSessionLossResetsCurrentWinStreak() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.of(existingRecord));
        when(repository.save(any(NumberNinjaRecord.class))).thenAnswer(i -> i.getArgument(0));

        NumberNinjaSessionRequestDto req = new NumberNinjaSessionRequestDto("session-lost", false, 7);
        NumberNinjaRecordDto result = service.submitSession(TEST_BROWSER_ID, req);

        assertThat(result.getTotalGamesPlayed()).isEqualTo(5);
        assertThat(result.getTotalGamesWon()).isEqualTo(3); // unchanged
        assertThat(result.getCurrentWinStreak()).isEqualTo(0); // reset
        assertThat(result.getBestWinStreak()).isEqualTo(2); // preserved
        assertThat(result.isNewPersonalBest()).isFalse();
    }

    @Test
    @DisplayName("submitSession is idempotent when receiving duplicate session ID")
    void testSubmitSessionIdempotency() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.of(existingRecord));

        // existingRecord has lastSessionId = "prev-session-123"
        NumberNinjaSessionRequestDto duplicateReq = new NumberNinjaSessionRequestDto("prev-session-123", true, 2);
        NumberNinjaRecordDto result = service.submitSession(TEST_BROWSER_ID, duplicateReq);

        // Should return existing record without calling repository.save() or incrementing games
        verify(repository, never()).save(any());
        assertThat(result.getTotalGamesPlayed()).isEqualTo(4); // still 4, not 5
        assertThat(result.getTotalGamesWon()).isEqualTo(3); // still 3, not 4
    }

    @Test
    @DisplayName("submitSession rejects invalid guesses count or mismatching loss count")
    void testSubmitSessionValidationFailures() {
        // guesses < 1
        NumberNinjaSessionRequestDto tooLow = new NumberNinjaSessionRequestDto("s1", true, 0);
        assertThatThrownBy(() -> service.submitSession(TEST_BROWSER_ID, tooLow))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("between 1 and 7");

        // guesses > 7
        NumberNinjaSessionRequestDto tooHigh = new NumberNinjaSessionRequestDto("s2", true, 8);
        assertThatThrownBy(() -> service.submitSession(TEST_BROWSER_ID, tooHigh))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("between 1 and 7");

        // lost session with < 7 guesses
        NumberNinjaSessionRequestDto invalidLoss = new NumberNinjaSessionRequestDto("s3", false, 6);
        assertThatThrownBy(() -> service.submitSession(TEST_BROWSER_ID, invalidLoss))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("lost session must have exactly 7 guesses");

        // missing session ID
        NumberNinjaSessionRequestDto noSessionId = new NumberNinjaSessionRequestDto("", true, 5);
        assertThatThrownBy(() -> service.submitSession(TEST_BROWSER_ID, noSessionId))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Session ID is required");
    }
}
