package com.arcadestop.service;

import com.arcadestop.dto.ReactionRushRecordDto;
import com.arcadestop.dto.ReactionRushSessionRequestDto;
import com.arcadestop.entity.ReactionRushRecord;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.ReactionRushRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReactionRushServiceTest {

    @Mock
    private ReactionRushRecordRepository repository;

    @InjectMocks
    private ReactionRushService reactionRushService;

    private static final String TEST_BROWSER_ID = "123e4567-e89b-12d3-a456-426614174000";

    private ReactionRushRecord existingRecord;

    @BeforeEach
    void setUp() {
        existingRecord = new ReactionRushRecord(TEST_BROWSER_ID, 250, 270, 2);
        existingRecord.setId(10L);
        existingRecord.setUpdatedAt(LocalDateTime.now().minusDays(1));
    }

    @Test
    @DisplayName("getRecord returns DTO when browserId exists")
    void testGetRecordSuccess() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.of(existingRecord));

        ReactionRushRecordDto dto = reactionRushService.getRecord(TEST_BROWSER_ID);

        assertThat(dto).isNotNull();
        assertThat(dto.getBrowserId()).isEqualTo(TEST_BROWSER_ID);
        assertThat(dto.getBestReactionMs()).isEqualTo(250);
        assertThat(dto.getAverageReactionMs()).isEqualTo(270);
        assertThat(dto.getTotalSessions()).isEqualTo(2);
        assertThat(dto.isNewPersonalBest()).isFalse();
        verify(repository, times(1)).findByBrowserId(TEST_BROWSER_ID);
    }

    @Test
    @DisplayName("getRecord throws ResourceNotFoundException when browserId is not found")
    void testGetRecordNotFound() {
        when(repository.findByBrowserId("unknown-id")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reactionRushService.getRecord("unknown-id"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("No record found for browser ID: unknown-id");

        verify(repository, times(1)).findByBrowserId("unknown-id");
    }

    @Test
    @DisplayName("submitSession creates brand new record when browserId not found")
    void testSubmitSessionNewRecord() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.empty());
        when(repository.save(any(ReactionRushRecord.class))).thenAnswer(invocation -> {
            ReactionRushRecord r = invocation.getArgument(0);
            r.setId(1L);
            return r;
        });

        ReactionRushSessionRequestDto request = new ReactionRushSessionRequestDto(List.of(200, 250, 300, 210, 240));
        ReactionRushRecordDto result = reactionRushService.submitSession(TEST_BROWSER_ID, request);

        assertThat(result).isNotNull();
        assertThat(result.getBrowserId()).isEqualTo(TEST_BROWSER_ID);
        assertThat(result.getBestReactionMs()).isEqualTo(200);
        // Average of 200, 250, 300, 210, 240 = 1200 / 5 = 240
        assertThat(result.getAverageReactionMs()).isEqualTo(240);
        assertThat(result.getTotalSessions()).isEqualTo(1);
        assertThat(result.isNewPersonalBest()).isTrue();

        ArgumentCaptor<ReactionRushRecord> captor = ArgumentCaptor.forClass(ReactionRushRecord.class);
        verify(repository).save(captor.capture());
        assertThat(captor.getValue().getBestReactionMs()).isEqualTo(200);
        assertThat(captor.getValue().getAverageReactionMs()).isEqualTo(240);
        assertThat(captor.getValue().getTotalSessions()).isEqualTo(1);
    }

    @Test
    @DisplayName("submitSession updates existing record with new personal best")
    void testSubmitSessionUpdateWithNewPersonalBest() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.of(existingRecord));
        when(repository.save(any(ReactionRushRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // existingRecord: best = 250, avg = 270, totalSessions = 2
        // session times: best = 210 (< 250), avg = 220
        // new totalSessions = 3
        // new rolling avg = round((270 * 2 + 220) / 3) = round(760 / 3) = 253
        ReactionRushSessionRequestDto request = new ReactionRushSessionRequestDto(List.of(210, 220, 230, 215, 225));
        ReactionRushRecordDto result = reactionRushService.submitSession(TEST_BROWSER_ID, request);

        assertThat(result.getBestReactionMs()).isEqualTo(210);
        assertThat(result.getAverageReactionMs()).isEqualTo(253);
        assertThat(result.getTotalSessions()).isEqualTo(3);
        assertThat(result.isNewPersonalBest()).isTrue();
    }

    @Test
    @DisplayName("submitSession updates existing record without new personal best when times are slower")
    void testSubmitSessionUpdateWithoutNewPersonalBest() {
        when(repository.findByBrowserId(TEST_BROWSER_ID)).thenReturn(Optional.of(existingRecord));
        when(repository.save(any(ReactionRushRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // existingRecord: best = 250, avg = 270, totalSessions = 2
        // session times: best = 310 (> 250), avg = 330
        // new totalSessions = 3
        // new rolling avg = round((270 * 2 + 330) / 3) = round(870 / 3) = 290
        ReactionRushSessionRequestDto request = new ReactionRushSessionRequestDto(List.of(310, 320, 330, 340, 350));
        ReactionRushRecordDto result = reactionRushService.submitSession(TEST_BROWSER_ID, request);

        assertThat(result.getBestReactionMs()).isEqualTo(250); // unchanged
        assertThat(result.getAverageReactionMs()).isEqualTo(290);
        assertThat(result.getTotalSessions()).isEqualTo(3);
        assertThat(result.isNewPersonalBest()).isFalse();
    }

    @Test
    @DisplayName("submitSession throws IllegalArgumentException when attempts count is not 5")
    void testSubmitSessionInvalidCount() {
        ReactionRushSessionRequestDto fourAttempts = new ReactionRushSessionRequestDto(List.of(200, 210, 220, 230));
        assertThatThrownBy(() -> reactionRushService.submitSession(TEST_BROWSER_ID, fourAttempts))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Exactly 5 reaction times are required");

        ReactionRushSessionRequestDto sixAttempts = new ReactionRushSessionRequestDto(List.of(200, 210, 220, 230, 240, 250));
        assertThatThrownBy(() -> reactionRushService.submitSession(TEST_BROWSER_ID, sixAttempts))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Exactly 5 reaction times are required");
    }

    @Test
    @DisplayName("submitSession throws IllegalArgumentException when any reaction time is null")
    void testSubmitSessionNullValue() {
        ReactionRushSessionRequestDto nullElement = new ReactionRushSessionRequestDto(Arrays.asList(200, null, 220, 230, 240));
        assertThatThrownBy(() -> reactionRushService.submitSession(TEST_BROWSER_ID, nullElement))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Reaction time cannot be null");
    }

    @Test
    @DisplayName("submitSession throws IllegalArgumentException when reaction time is zero or negative")
    void testSubmitSessionZeroOrNegative() {
        ReactionRushSessionRequestDto zeroValue = new ReactionRushSessionRequestDto(List.of(200, 0, 220, 230, 240));
        assertThatThrownBy(() -> reactionRushService.submitSession(TEST_BROWSER_ID, zeroValue))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Each reaction time must be between 1 and 5000 ms");

        ReactionRushSessionRequestDto negativeValue = new ReactionRushSessionRequestDto(List.of(200, -15, 220, 230, 240));
        assertThatThrownBy(() -> reactionRushService.submitSession(TEST_BROWSER_ID, negativeValue))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Each reaction time must be between 1 and 5000 ms");
    }

    @Test
    @DisplayName("submitSession throws IllegalArgumentException when reaction time exceeds max 5000ms")
    void testSubmitSessionExceedsMax() {
        ReactionRushSessionRequestDto overMax = new ReactionRushSessionRequestDto(List.of(200, 5001, 220, 230, 240));
        assertThatThrownBy(() -> reactionRushService.submitSession(TEST_BROWSER_ID, overMax))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Each reaction time must be between 1 and 5000 ms");
    }
}
