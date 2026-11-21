package com.arcadestop.service;

import com.arcadestop.dto.SequenceMasterOverviewDto;
import com.arcadestop.dto.SequenceMasterRecordDto;
import com.arcadestop.dto.SequenceMasterSessionRequestDto;
import com.arcadestop.entity.SequenceMasterRecord;
import com.arcadestop.entity.SequenceMasterSession;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.SequenceMasterRecordRepository;
import com.arcadestop.repository.SequenceMasterSessionRepository;
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
class SequenceMasterServiceTest {

    @Mock
    private SequenceMasterRecordRepository recordRepository;

    @Mock
    private SequenceMasterSessionRepository sessionRepository;

    @InjectMocks
    private SequenceMasterService service;

    private static final String BROWSER_ID = "00000000-0000-4000-8000-000000000006";

    @Test
    @DisplayName("getOverview returns all records grouped by difficulty")
    void testGetOverview() {
        SequenceMasterRecord easy = new SequenceMasterRecord(BROWSER_ID, "EASY");
        easy.setId(1L);
        easy.setTotalGamesPlayed(3);
        easy.setHighestScore(330);
        easy.setTotalScoreSum(640L);
        easy.setHighestSequenceLength(4);
        easy.setTotalSequenceLengthSum(10L);

        SequenceMasterRecord hard = new SequenceMasterRecord(BROWSER_ID, "HARD");
        hard.setId(2L);
        hard.setTotalGamesPlayed(1);
        hard.setHighestScore(100);
        hard.setTotalScoreSum(100L);
        hard.setHighestSequenceLength(2);
        hard.setTotalSequenceLengthSum(2L);

        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(List.of(easy, hard));

        SequenceMasterOverviewDto overview = service.getOverview(BROWSER_ID);

        assertThat(overview.getBrowserId()).isEqualTo(BROWSER_ID);
        assertThat(overview.getEasy()).isNotNull();
        assertThat(overview.getEasy().getHighestScore()).isEqualTo(330);
        assertThat(overview.getEasy().getAverageScore()).isEqualTo(213.3); // 640/3
        assertThat(overview.getMedium()).isNull(); // not played yet
        assertThat(overview.getHard()).isNotNull();
        assertThat(overview.getHard().getHighestScore()).isEqualTo(100);
    }

    @Test
    @DisplayName("getRecord returns existing record DTO for specified difficulty")
    void testGetRecordSuccess() {
        SequenceMasterRecord record = new SequenceMasterRecord(BROWSER_ID, "MEDIUM");
        record.setId(10L);
        record.setTotalGamesPlayed(2);
        record.setHighestScore(210);
        record.setTotalScoreSum(310L);
        record.setHighestSequenceLength(3);
        record.setTotalSequenceLengthSum(5L);
        record.setTotalCompletedRounds(3L);
        record.setTotalCorrectTileInputs(6L);

        when(recordRepository.findByBrowserIdAndDifficulty(BROWSER_ID, "MEDIUM")).thenReturn(Optional.of(record));

        SequenceMasterRecordDto dto = service.getRecord(BROWSER_ID, "MEDIUM");

        assertThat(dto.getDifficulty()).isEqualTo("MEDIUM");
        assertThat(dto.getTotalGamesPlayed()).isEqualTo(2);
        assertThat(dto.getHighestScore()).isEqualTo(210);
        assertThat(dto.getAverageScore()).isEqualTo(155.0);
        assertThat(dto.getHighestSequenceLength()).isEqualTo(3);
        assertThat(dto.getAverageSequenceLength()).isEqualTo(2.5);
    }

    @Test
    @DisplayName("getRecord throws ResourceNotFoundException when difficulty record not found")
    void testGetRecordNotFound() {
        when(recordRepository.findByBrowserIdAndDifficulty(anyString(), anyString())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getRecord(BROWSER_ID, "HARD"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    @DisplayName("submitSession saves new session and creates initial record with PB")
    void testSubmitSessionFirstGame() {
        when(recordRepository.findByBrowserIdAndDifficulty(BROWSER_ID, "EASY")).thenReturn(Optional.empty());
        when(sessionRepository.existsBySessionId(anyString())).thenReturn(false);
        when(recordRepository.save(any(SequenceMasterRecord.class))).thenAnswer(i -> i.getArgument(0));

        // 3 completed rounds: round 1 (100) + round 2 (110) + round 3 (120) = 330 pts
        // sequence length reached: 4, correct tiles: 1 + 2 + 3 = 6
        SequenceMasterSessionRequestDto request = new SequenceMasterSessionRequestDto(
                "sess-sm-1",
                "EASY",
                330,
                4,
                3,
                6,
                25.5
        );

        SequenceMasterRecordDto dto = service.submitSession(BROWSER_ID, request);

        assertThat(dto).isNotNull();
        assertThat(dto.getDifficulty()).isEqualTo("EASY");
        assertThat(dto.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(dto.getHighestScore()).isEqualTo(330);
        assertThat(dto.getAverageScore()).isEqualTo(330.0);
        assertThat(dto.getHighestSequenceLength()).isEqualTo(4);
        assertThat(dto.getTotalCompletedRounds()).isEqualTo(3L);
        assertThat(dto.getTotalCorrectTileInputs()).isEqualTo(6L);
        assertThat(dto.isNewPersonalBest()).isTrue();

        // Verify session persistence
        ArgumentCaptor<SequenceMasterSession> sessionCaptor = ArgumentCaptor.forClass(SequenceMasterSession.class);
        verify(sessionRepository, times(1)).save(sessionCaptor.capture());
        SequenceMasterSession saved = sessionCaptor.getValue();
        assertThat(saved.getSessionId()).isEqualTo("sess-sm-1");
        assertThat(saved.getDifficulty()).isEqualTo("EASY");
        assertThat(saved.getScore()).isEqualTo(330);
    }

    @Test
    @DisplayName("submitSession operates independently per difficulty without cross-contamination")
    void testSubmitSessionIndependentDifficulties() {
        // Player already has Medium record with 460 points
        SequenceMasterRecord mediumRecord = new SequenceMasterRecord(BROWSER_ID, "MEDIUM");
        mediumRecord.setTotalGamesPlayed(1);
        mediumRecord.setHighestScore(460);

        // Player now plays EASY mode and scores 100 points
        when(recordRepository.findByBrowserIdAndDifficulty(BROWSER_ID, "EASY")).thenReturn(Optional.empty());
        when(sessionRepository.existsBySessionId(anyString())).thenReturn(false);
        when(recordRepository.save(any(SequenceMasterRecord.class))).thenAnswer(i -> i.getArgument(0));

        SequenceMasterSessionRequestDto request = new SequenceMasterSessionRequestDto(
                "sess-sm-easy",
                "EASY",
                100,
                2,
                1,
                1,
                10.0
        );

        SequenceMasterRecordDto easyDto = service.submitSession(BROWSER_ID, request);

        // Easy record is independent and has 100 points
        assertThat(easyDto.getDifficulty()).isEqualTo("EASY");
        assertThat(easyDto.getHighestScore()).isEqualTo(100);
        assertThat(easyDto.isNewPersonalBest()).isTrue();

        // Medium record is untouched
        assertThat(mediumRecord.getHighestScore()).isEqualTo(460);
    }

    @Test
    @DisplayName("submitSession detects duplicate submission and does not increment stats")
    void testSubmitSessionDuplicate() {
        SequenceMasterRecord existing = new SequenceMasterRecord(BROWSER_ID, "HARD");
        existing.setTotalGamesPlayed(1);
        existing.setHighestScore(100);
        existing.setLastSessionId("sess-sm-dup");

        when(recordRepository.findByBrowserIdAndDifficulty(BROWSER_ID, "HARD")).thenReturn(Optional.of(existing));
        when(sessionRepository.existsBySessionId("sess-sm-dup")).thenReturn(true);

        SequenceMasterSessionRequestDto request = new SequenceMasterSessionRequestDto(
                "sess-sm-dup",
                "HARD",
                100,
                2,
                1,
                1,
                8.0
        );

        SequenceMasterRecordDto dto = service.submitSession(BROWSER_ID, request);

        assertThat(dto.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(dto.isNewPersonalBest()).isFalse();
        verify(sessionRepository, never()).save(any(SequenceMasterSession.class));
        verify(recordRepository, never()).save(any(SequenceMasterRecord.class));
    }

    @Test
    @DisplayName("submitSession rejects invalid difficulty")
    void testSubmitSessionInvalidDifficulty() {
        SequenceMasterSessionRequestDto request = new SequenceMasterSessionRequestDto(
                "sess-sm-bad",
                "NIGHTMARE", // invalid difficulty
                100,
                2,
                1,
                1,
                10.0
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Difficulty must be one of: EASY, MEDIUM, HARD");
    }

    @Test
    @DisplayName("submitSession rejects inconsistent score for completed rounds")
    void testSubmitSessionInconsistentScore() {
        SequenceMasterSessionRequestDto request = new SequenceMasterSessionRequestDto(
                "sess-sm-bad",
                "EASY",
                9999, // score doesn't match 1 completed round (expected 100)
                2,
                1,
                1,
                10.0
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("does not match expected score");
    }
}
