package com.arcadestop.service;

import com.arcadestop.dto.MemoryMadnessOverviewDto;
import com.arcadestop.dto.MemoryMadnessRecordDto;
import com.arcadestop.dto.MemoryMadnessSessionRequestDto;
import com.arcadestop.entity.MemoryMadnessRecord;
import com.arcadestop.entity.MemoryMadnessSession;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.MemoryMadnessRecordRepository;
import com.arcadestop.repository.MemoryMadnessSessionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MemoryMadnessServiceTest {

    @Mock
    private MemoryMadnessRecordRepository recordRepository;

    @Mock
    private MemoryMadnessSessionRepository sessionRepository;

    @InjectMocks
    private MemoryMadnessService service;

    private static final String BROWSER_ID = "00000000-0000-4000-8000-000000000007";

    @Test
    @DisplayName("getOverview returns all records grouped by difficulty")
    void testGetOverview() {
        MemoryMadnessRecord easy = new MemoryMadnessRecord(BROWSER_ID, "EASY");
        easy.setId(1L);
        easy.setTotalGamesPlayed(2);
        easy.setBestScore(1150);
        easy.setTotalScoreSum(2100L);
        easy.setBestCompletionTime(35.5);
        easy.setTotalCompletionTimeSum(80.0);
        easy.setBestMoveCount(10);
        easy.setTotalMoveCountSum(24L);
        easy.setBestAccuracy(80.0);
        easy.setTotalAccuracySum(150.0);
        easy.setTotalPairsMatched(16L);

        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(List.of(easy));

        MemoryMadnessOverviewDto overview = service.getOverview(BROWSER_ID);

        assertThat(overview.getBrowserId()).isEqualTo(BROWSER_ID);
        assertThat(overview.getEasy()).isNotNull();
        assertThat(overview.getEasy().getBestScore()).isEqualTo(1150);
        assertThat(overview.getEasy().getAverageScore()).isEqualTo(1050.0); // 2100/2
        assertThat(overview.getEasy().getBestCompletionTime()).isEqualTo(35.5);
        assertThat(overview.getEasy().getAverageCompletionTime()).isEqualTo(40.0); // 80/2
        assertThat(overview.getEasy().getBestMoveCount()).isEqualTo(10);
        assertThat(overview.getEasy().getAverageMoveCount()).isEqualTo(12.0); // 24/2
        assertThat(overview.getMedium()).isNull();
        assertThat(overview.getHard()).isNull();
    }

    @Test
    @DisplayName("getRecord returns existing record DTO for specified difficulty")
    void testGetRecordSuccess() {
        MemoryMadnessRecord record = new MemoryMadnessRecord(BROWSER_ID, "MEDIUM");
        record.setId(5L);
        record.setTotalGamesPlayed(1);
        record.setBestScore(2100);
        record.setTotalScoreSum(2100L);
        record.setBestCompletionTime(110.0);
        record.setTotalCompletionTimeSum(110.0);
        record.setBestMoveCount(26);
        record.setTotalMoveCountSum(26L);
        record.setBestAccuracy(69.2);
        record.setTotalAccuracySum(69.2);
        record.setTotalPairsMatched(18L);

        when(recordRepository.findByBrowserIdAndDifficulty(BROWSER_ID, "MEDIUM")).thenReturn(Optional.of(record));

        MemoryMadnessRecordDto dto = service.getRecord(BROWSER_ID, "MEDIUM");

        assertThat(dto.getDifficulty()).isEqualTo("MEDIUM");
        assertThat(dto.getBestScore()).isEqualTo(2100);
        assertThat(dto.getBestCompletionTime()).isEqualTo(110.0);
        assertThat(dto.getBestMoveCount()).isEqualTo(26);
        assertThat(dto.getBestAccuracy()).isEqualTo(69.2);
        assertThat(dto.getTotalPairsMatched()).isEqualTo(18L);
    }

    @Test
    @DisplayName("getRecord throws ResourceNotFoundException when record does not exist")
    void testGetRecordNotFound() {
        when(recordRepository.findByBrowserIdAndDifficulty(anyString(), anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getRecord(BROWSER_ID, "HARD"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("submitSession calculates accuracy, saves session, and creates initial record")
    void testSubmitSessionFirstGame() {
        when(recordRepository.findByBrowserIdAndDifficulty(BROWSER_ID, "EASY")).thenReturn(Optional.empty());
        when(sessionRepository.existsBySessionId(anyString())).thenReturn(false);
        when(recordRepository.save(any(MemoryMadnessRecord.class))).thenAnswer(i -> i.getArgument(0));

        // Easy mode: 8 pairs matched in 10 moves (8 matches, 2 mismatches) -> 8/10 = 80.0% accuracy
        MemoryMadnessSessionRequestDto request = new MemoryMadnessSessionRequestDto(
                "sess-mm-1",
                "EASY",
                1100,
                38.5,
                10,
                8,
                2,
                80.0
        );

        MemoryMadnessRecordDto dto = service.submitSession(BROWSER_ID, request);

        assertThat(dto).isNotNull();
        assertThat(dto.getDifficulty()).isEqualTo("EASY");
        assertThat(dto.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(dto.getBestScore()).isEqualTo(1100);
        assertThat(dto.getAverageScore()).isEqualTo(1100.0);
        assertThat(dto.getBestCompletionTime()).isEqualTo(38.5);
        assertThat(dto.getBestMoveCount()).isEqualTo(10);
        assertThat(dto.getBestAccuracy()).isEqualTo(80.0);
        assertThat(dto.getTotalPairsMatched()).isEqualTo(8L);
        assertThat(dto.isNewPersonalBest()).isTrue();

        ArgumentCaptor<MemoryMadnessSession> sessionCaptor = ArgumentCaptor.forClass(MemoryMadnessSession.class);
        verify(sessionRepository, times(1)).save(sessionCaptor.capture());
        MemoryMadnessSession saved = sessionCaptor.getValue();
        assertThat(saved.getSessionId()).isEqualTo("sess-mm-1");
        assertThat(saved.getDifficulty()).isEqualTo("EASY");
        assertThat(saved.getAccuracy()).isEqualTo(80.0);
    }

    @Test
    @DisplayName("submitSession maintains independent statistics across difficulty modes")
    void testSubmitSessionIndependentDifficulties() {
        MemoryMadnessRecord easyRecord = new MemoryMadnessRecord(BROWSER_ID, "EASY");
        easyRecord.setTotalGamesPlayed(1);
        easyRecord.setBestScore(1200);

        when(recordRepository.findByBrowserIdAndDifficulty(BROWSER_ID, "MEDIUM")).thenReturn(Optional.empty());
        when(sessionRepository.existsBySessionId(anyString())).thenReturn(false);
        when(recordRepository.save(any(MemoryMadnessRecord.class))).thenAnswer(i -> i.getArgument(0));

        // Medium mode: 18 pairs matched in 24 moves (18 matches, 6 mismatches)
        MemoryMadnessSessionRequestDto request = new MemoryMadnessSessionRequestDto(
                "sess-mm-med",
                "MEDIUM",
                2350,
                115.0,
                24,
                18,
                6,
                75.0
        );

        MemoryMadnessRecordDto medDto = service.submitSession(BROWSER_ID, request);

        assertThat(medDto.getDifficulty()).isEqualTo("MEDIUM");
        assertThat(medDto.getBestScore()).isEqualTo(2350);
        assertThat(medDto.isNewPersonalBest()).isTrue();

        // Easy record was untouched
        assertThat(easyRecord.getBestScore()).isEqualTo(1200);
    }

    @Test
    @DisplayName("submitSession detects duplicate submission and does not increment stats")
    void testSubmitSessionDuplicate() {
        MemoryMadnessRecord existing = new MemoryMadnessRecord(BROWSER_ID, "EASY");
        existing.setTotalGamesPlayed(1);
        existing.setBestScore(1000);
        existing.setLastSessionId("sess-mm-dup");

        when(recordRepository.findByBrowserIdAndDifficulty(BROWSER_ID, "EASY")).thenReturn(Optional.of(existing));
        when(sessionRepository.existsBySessionId("sess-mm-dup")).thenReturn(true);

        MemoryMadnessSessionRequestDto request = new MemoryMadnessSessionRequestDto(
                "sess-mm-dup",
                "EASY",
                1000,
                40.0,
                10,
                8,
                2,
                80.0
        );

        MemoryMadnessRecordDto dto = service.submitSession(BROWSER_ID, request);

        assertThat(dto.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(dto.isNewPersonalBest()).isFalse();
        verify(sessionRepository, never()).save(any(MemoryMadnessSession.class));
        verify(recordRepository, never()).save(any(MemoryMadnessRecord.class));
    }

    @Test
    @DisplayName("submitSession rejects invalid matched pairs for difficulty mode")
    void testSubmitSessionInvalidMatchedPairs() {
        MemoryMadnessSessionRequestDto request = new MemoryMadnessSessionRequestDto(
                "sess-mm-bad",
                "EASY",
                1000,
                30.0,
                10,
                7, // invalid: Easy requires exactly 8 pairs
                3,
                70.0
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must equal required pairs (8) for EASY mode");
    }

    @Test
    @DisplayName("submitSession rejects inconsistent moves and mismatches")
    void testSubmitSessionInconsistentMoves() {
        MemoryMadnessSessionRequestDto request = new MemoryMadnessSessionRequestDto(
                "sess-mm-bad",
                "EASY",
                1000,
                30.0,
                10,
                8,
                5, // 10 total moves with 8 matches cannot have 5 mismatches (must be 2)
                80.0
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Mismatched attempts must equal total moves minus matched pairs");
    }
}
