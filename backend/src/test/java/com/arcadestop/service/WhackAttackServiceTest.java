package com.arcadestop.service;

import com.arcadestop.dto.WhackAttackRecordDto;
import com.arcadestop.dto.WhackAttackSessionRequestDto;
import com.arcadestop.entity.WhackAttackRecord;
import com.arcadestop.entity.WhackAttackSession;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.WhackAttackRecordRepository;
import com.arcadestop.repository.WhackAttackSessionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WhackAttackServiceTest {

    @Mock
    private WhackAttackRecordRepository recordRepository;

    @Mock
    private WhackAttackSessionRepository sessionRepository;

    @InjectMocks
    private WhackAttackService service;

    private static final String BROWSER_ID = "00000000-0000-4000-8000-000000000005";

    @Test
    @DisplayName("getRecord returns existing record DTO")
    void testGetRecordSuccess() {
        WhackAttackRecord record = new WhackAttackRecord(BROWSER_ID);
        record.setId(1L);
        record.setTotalGamesPlayed(3);
        record.setHighestScore(350);
        record.setTotalScoreSum(900L);
        record.setTotalHits(75L);
        record.setBestAccuracy(95.0);
        record.setTotalAccuracySum(270.0);
        record.setBestCombo(12);
        record.setTotalMissedTargets(5L);
        record.setTotalEmptyClicks(3L);

        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(Optional.of(record));

        WhackAttackRecordDto dto = service.getRecord(BROWSER_ID);

        assertThat(dto.getBrowserId()).isEqualTo(BROWSER_ID);
        assertThat(dto.getTotalGamesPlayed()).isEqualTo(3);
        assertThat(dto.getHighestScore()).isEqualTo(350);
        assertThat(dto.getAverageScore()).isEqualTo(300.0); // 900 / 3
        assertThat(dto.getTotalHits()).isEqualTo(75L);
        assertThat(dto.getBestAccuracy()).isEqualTo(95.0);
        assertThat(dto.getAverageAccuracy()).isEqualTo(90.0); // 270 / 3
        assertThat(dto.getBestCombo()).isEqualTo(12);
        assertThat(dto.getTotalMissedTargets()).isEqualTo(5L);
        assertThat(dto.getTotalEmptyClicks()).isEqualTo(3L);
    }

    @Test
    @DisplayName("getRecord throws ResourceNotFoundException when record does not exist")
    void testGetRecordNotFound() {
        when(recordRepository.findByBrowserId(anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getRecord(BROWSER_ID))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining(BROWSER_ID);
    }

    @Test
    @DisplayName("submitSession calculates server accuracy, creates record, and flags new personal best")
    void testSubmitSessionFirstGame() {
        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(Optional.empty());
        when(sessionRepository.existsBySessionId(anyString())).thenReturn(false);
        when(recordRepository.save(any(WhackAttackRecord.class))).thenAnswer(i -> i.getArgument(0));

        // 30s session, 25 hits, 3 misses, 2 empty clicks => 25/30 = 83.3% accuracy, score = 300, bestCombo = 8
        WhackAttackSessionRequestDto request = new WhackAttackSessionRequestDto(
                "sess-wa-1",
                30,
                300,
                25,
                3,
                2,
                8,
                30.0
        );

        WhackAttackRecordDto dto = service.submitSession(BROWSER_ID, request);

        assertThat(dto).isNotNull();
        assertThat(dto.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(dto.getHighestScore()).isEqualTo(300);
        assertThat(dto.getAverageScore()).isEqualTo(300.0);
        assertThat(dto.getTotalHits()).isEqualTo(25L);
        assertThat(dto.getTotalMissedTargets()).isEqualTo(3L);
        assertThat(dto.getTotalEmptyClicks()).isEqualTo(2L);
        assertThat(dto.getBestAccuracy()).isEqualTo(83.3);
        assertThat(dto.getBestCombo()).isEqualTo(8);
        assertThat(dto.isNewPersonalBest()).isTrue();

        // Verify session was saved
        ArgumentCaptor<WhackAttackSession> sessionCaptor = ArgumentCaptor.forClass(WhackAttackSession.class);
        verify(sessionRepository, times(1)).save(sessionCaptor.capture());
        WhackAttackSession savedSession = sessionCaptor.getValue();
        assertThat(savedSession.getSessionId()).isEqualTo("sess-wa-1");
        assertThat(savedSession.getScore()).isEqualTo(300);
        assertThat(savedSession.getHits()).isEqualTo(25);
        assertThat(savedSession.getAccuracy()).isEqualTo(83.3);
    }

    @Test
    @DisplayName("submitSession detects duplicate submission and does not increment stats")
    void testSubmitSessionDuplicate() {
        WhackAttackRecord existingRecord = new WhackAttackRecord(BROWSER_ID);
        existingRecord.setTotalGamesPlayed(1);
        existingRecord.setHighestScore(250);
        existingRecord.setLastSessionId("sess-wa-1");

        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(Optional.of(existingRecord));
        when(sessionRepository.existsBySessionId("sess-wa-1")).thenReturn(true);

        WhackAttackSessionRequestDto request = new WhackAttackSessionRequestDto(
                "sess-wa-1",
                30,
                250,
                20,
                2,
                1,
                5,
                30.0
        );

        WhackAttackRecordDto dto = service.submitSession(BROWSER_ID, request);

        assertThat(dto.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(dto.isNewPersonalBest()).isFalse();
        verify(sessionRepository, never()).save(any(WhackAttackSession.class));
        verify(recordRepository, never()).save(any(WhackAttackRecord.class));
    }

    @Test
    @DisplayName("submitSession rejects invalid duration")
    void testSubmitSessionInvalidDuration() {
        WhackAttackSessionRequestDto request = new WhackAttackSessionRequestDto(
                "sess-wa-bad",
                45, // invalid (only 30 or 60 allowed)
                200,
                20,
                0,
                0,
                5,
                45.0
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Duration must be one of: 30, 60");
    }

    @Test
    @DisplayName("submitSession rejects bestCombo exceeding hits")
    void testSubmitSessionBestComboExceedingHits() {
        WhackAttackSessionRequestDto request = new WhackAttackSessionRequestDto(
                "sess-wa-bad",
                30,
                150,
                10,
                0,
                0,
                15, // combo > hits (impossible)
                30.0
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Best combo cannot exceed total successful hits");
    }

    @Test
    @DisplayName("submitSession rejects physically impossible hit count")
    void testSubmitSessionImpossiblyHighHits() {
        WhackAttackSessionRequestDto request = new WhackAttackSessionRequestDto(
                "sess-wa-bad",
                30,
                2500,
                200, // in 30s, 200 hits exceeds 30 * 5
                0,
                0,
                20,
                30.0
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Reported hit count exceeds physically possible maximum");
    }
}
