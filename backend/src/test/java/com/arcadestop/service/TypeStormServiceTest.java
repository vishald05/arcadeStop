package com.arcadestop.service;

import com.arcadestop.dto.TypeStormRecordDto;
import com.arcadestop.dto.TypeStormSessionRequestDto;
import com.arcadestop.entity.TypeStormRecord;
import com.arcadestop.entity.TypeStormSession;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.TypeStormRecordRepository;
import com.arcadestop.repository.TypeStormSessionRepository;
import org.junit.jupiter.api.BeforeEach;
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
class TypeStormServiceTest {

    @Mock
    private TypeStormRecordRepository recordRepository;

    @Mock
    private TypeStormSessionRepository sessionRepository;

    @InjectMocks
    private TypeStormService service;

    private static final String BROWSER_ID = "00000000-0000-4000-8000-000000000001";

    @Test
    @DisplayName("getRecord returns existing record DTO")
    void testGetRecordSuccess() {
        TypeStormRecord record = new TypeStormRecord(BROWSER_ID);
        record.setId(1L);
        record.setTotalGamesPlayed(5);
        record.setBestWpm(85);
        record.setTotalWpmSum(380L);
        record.setBestAccuracy(98.5);
        record.setTotalAccuracySum(480.0);
        record.setTotalCharactersTyped(1500L);
        record.setTotalMistakes(20L);

        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(Optional.of(record));

        TypeStormRecordDto dto = service.getRecord(BROWSER_ID);

        assertThat(dto.getBrowserId()).isEqualTo(BROWSER_ID);
        assertThat(dto.getTotalGamesPlayed()).isEqualTo(5);
        assertThat(dto.getBestWpm()).isEqualTo(85);
        assertThat(dto.getAverageWpm()).isEqualTo(76.0); // 380 / 5
        assertThat(dto.getBestAccuracy()).isEqualTo(98.5);
        assertThat(dto.getAverageAccuracy()).isEqualTo(96.0); // 480 / 5
        assertThat(dto.getTotalCharactersTyped()).isEqualTo(1500L);
        assertThat(dto.getTotalMistakes()).isEqualTo(20L);
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
    @DisplayName("submitSession calculates official WPM, accuracy, saves session, and creates initial record with PB")
    void testSubmitSessionFirstGame() {
        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(Optional.empty());
        when(sessionRepository.existsBySessionId("sess-1")).thenReturn(false);
        when(recordRepository.save(any(TypeStormRecord.class))).thenAnswer(i -> {
            TypeStormRecord r = i.getArgument(0);
            r.setId(10L);
            return r;
        });

        // 30 seconds, 150 correct chars, 5 mistakes -> 155 total typed, elapsed = 30s (0.5 min)
        // WPM = (150 / 5) / 0.5 = 60 WPM
        // Accuracy = (150 / 155) * 100 = 96.8%
        TypeStormSessionRequestDto req = new TypeStormSessionRequestDto(
                "sess-1", 30, 150, 5, 155, 30.0
        );

        TypeStormRecordDto result = service.submitSession(BROWSER_ID, req);

        assertThat(result.getTotalGamesPlayed()).isEqualTo(1);
        assertThat(result.getBestWpm()).isEqualTo(60);
        assertThat(result.getAverageWpm()).isEqualTo(60.0);
        assertThat(result.getBestAccuracy()).isEqualTo(96.8);
        assertThat(result.getAverageAccuracy()).isEqualTo(96.8);
        assertThat(result.getTotalCharactersTyped()).isEqualTo(155L);
        assertThat(result.getTotalMistakes()).isEqualTo(5L);
        assertThat(result.isNewPersonalBest()).isTrue();

        verify(sessionRepository, times(1)).save(any(TypeStormSession.class));
        verify(recordRepository, times(1)).save(any(TypeStormRecord.class));
    }

    @Test
    @DisplayName("submitSession updates existing record, tracks higher PB, and recalculates averages")
    void testSubmitSessionSecondGameNewPB() {
        TypeStormRecord existing = new TypeStormRecord(BROWSER_ID);
        existing.setId(1L);
        existing.setTotalGamesPlayed(1);
        existing.setBestWpm(60);
        existing.setTotalWpmSum(60L);
        existing.setBestAccuracy(96.8);
        existing.setTotalAccuracySum(96.8);
        existing.setTotalCharactersTyped(155L);
        existing.setTotalMistakes(5L);
        existing.setLastSessionId("sess-1");

        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(Optional.of(existing));
        when(sessionRepository.existsBySessionId("sess-2")).thenReturn(false);
        when(recordRepository.save(any(TypeStormRecord.class))).thenAnswer(i -> i.getArgument(0));

        // Round 2: 15s test, 100 correct chars, 0 mistakes -> 100 total, 15s (0.25 min)
        // WPM = (100 / 5) / 0.25 = 80 WPM
        // Accuracy = 100.0%
        TypeStormSessionRequestDto req = new TypeStormSessionRequestDto(
                "sess-2", 15, 100, 0, 100, 15.0
        );

        TypeStormRecordDto result = service.submitSession(BROWSER_ID, req);

        assertThat(result.getTotalGamesPlayed()).isEqualTo(2);
        assertThat(result.getBestWpm()).isEqualTo(80); // higher than 60
        assertThat(result.getAverageWpm()).isEqualTo(70.0); // (60 + 80) / 2
        assertThat(result.getBestAccuracy()).isEqualTo(100.0); // higher than 96.8
        assertThat(result.getTotalCharactersTyped()).isEqualTo(255L);
        assertThat(result.getTotalMistakes()).isEqualTo(5L);
        assertThat(result.isNewPersonalBest()).isTrue();
    }

    @Test
    @DisplayName("submitSession handles idempotency on duplicate sessionId without incrementing")
    void testSubmitSessionIdempotency() {
        TypeStormRecord existing = new TypeStormRecord(BROWSER_ID);
        existing.setId(1L);
        existing.setTotalGamesPlayed(1);
        existing.setBestWpm(60);
        existing.setLastSessionId("sess-1");

        when(recordRepository.findByBrowserId(BROWSER_ID)).thenReturn(Optional.of(existing));
        when(sessionRepository.existsBySessionId("sess-1")).thenReturn(true);

        TypeStormSessionRequestDto req = new TypeStormSessionRequestDto(
                "sess-1", 30, 150, 5, 155, 30.0
        );

        TypeStormRecordDto result = service.submitSession(BROWSER_ID, req);

        assertThat(result.getTotalGamesPlayed()).isEqualTo(1);
        verify(sessionRepository, never()).save(any(TypeStormSession.class));
        verify(recordRepository, never()).save(any(TypeStormRecord.class));
    }

    @Test
    @DisplayName("submitSession rejects invalid duration")
    void testSubmitSessionInvalidDuration() {
        TypeStormSessionRequestDto req = new TypeStormSessionRequestDto(
                "sess-1", 45, 100, 0, 100, 45.0 // 45 is not 15, 30, or 60
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Duration must be one of: 15, 30, 60 seconds");
    }

    @Test
    @DisplayName("submitSession rejects total characters less than correct characters")
    void testSubmitSessionTotalLessThanCorrect() {
        TypeStormSessionRequestDto req = new TypeStormSessionRequestDto(
                "sess-1", 30, 100, 5, 90, 30.0 // total 90 < correct 100
        );

        assertThatThrownBy(() -> service.submitSession(BROWSER_ID, req))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Total characters typed cannot be less than correct characters");
    }
}
