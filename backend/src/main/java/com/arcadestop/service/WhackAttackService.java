package com.arcadestop.service;

import com.arcadestop.dto.PagedResponseDto;
import com.arcadestop.dto.WhackAttackRecordDto;
import com.arcadestop.dto.WhackAttackSessionDto;
import com.arcadestop.dto.WhackAttackSessionRequestDto;
import com.arcadestop.entity.WhackAttackRecord;
import com.arcadestop.entity.WhackAttackSession;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.WhackAttackRecordRepository;
import com.arcadestop.repository.WhackAttackSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class WhackAttackService {

    private static final Logger logger = LoggerFactory.getLogger(WhackAttackService.class);
    private static final Set<Integer> ALLOWED_DURATIONS = Set.of(30, 60);

    private final WhackAttackRecordRepository recordRepository;
    private final WhackAttackSessionRepository sessionRepository;

    public WhackAttackService(WhackAttackRecordRepository recordRepository,
                              WhackAttackSessionRepository sessionRepository) {
        this.recordRepository = recordRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public WhackAttackRecordDto getRecord(String browserId) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        WhackAttackRecord record = recordRepository.findByBrowserId(browserId.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No record found for browser ID: " + browserId));
        return WhackAttackRecordDto.fromEntity(record, false);
    }

    @Transactional
    public WhackAttackRecordDto submitSession(String browserId, WhackAttackSessionRequestDto request) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        if (request == null) {
            throw new IllegalArgumentException("Request body cannot be null");
        }
        if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
            throw new IllegalArgumentException("Session ID is required for idempotency");
        }
        if (request.getDurationSeconds() == null || !ALLOWED_DURATIONS.contains(request.getDurationSeconds())) {
            throw new IllegalArgumentException("Duration must be one of: 30, 60 seconds");
        }
        if (request.getHits() == null || request.getHits() < 0) {
            throw new IllegalArgumentException("Hits must be a non-negative integer");
        }
        if (request.getMisses() == null || request.getMisses() < 0) {
            throw new IllegalArgumentException("Misses must be a non-negative integer");
        }
        if (request.getEmptyClicks() == null || request.getEmptyClicks() < 0) {
            throw new IllegalArgumentException("Empty clicks must be a non-negative integer");
        }
        if (request.getBestCombo() == null || request.getBestCombo() < 0) {
            throw new IllegalArgumentException("Best combo must be a non-negative integer");
        }
        if (request.getBestCombo() > request.getHits()) {
            throw new IllegalArgumentException("Best combo cannot exceed total successful hits");
        }
        if (request.getScore() == null || request.getScore() < 0) {
            throw new IllegalArgumentException("Score must be a non-negative integer");
        }
        if (request.getElapsedSeconds() == null || request.getElapsedSeconds() <= 0.0) {
            throw new IllegalArgumentException("Elapsed seconds must be greater than zero");
        }
        if (request.getElapsedSeconds() > request.getDurationSeconds() + 10.0) {
            throw new IllegalArgumentException("Elapsed time exceeds maximum allowed session duration");
        }

        // Physical plausibility checks:
        // Even with impossibly quick ~150ms cycles, max hits could not exceed 5 per second
        if (request.getHits() > request.getDurationSeconds() * 5) {
            throw new IllegalArgumentException("Reported hit count exceeds physically possible maximum");
        }

        // Score plausibility check:
        // Each hit gives at least 10 base points, and at most 20 points (with max combo bonus of 10)
        int minPossibleScore = request.getHits() * 10;
        int maxPossibleScore = request.getHits() * 20;
        if (request.getHits() == 0 && request.getScore() != 0) {
            throw new IllegalArgumentException("Score must be 0 when hits are 0");
        }
        if (request.getHits() > 0 && (request.getScore() < minPossibleScore || request.getScore() > maxPossibleScore)) {
            throw new IllegalArgumentException("Reported score is outside valid range for hits scored");
        }

        String cleanBrowserId = browserId.trim();
        String cleanSessionId = request.getSessionId().trim();

        Optional<WhackAttackRecord> existing = recordRepository.findByBrowserId(cleanBrowserId);

        // Idempotency check: if session was already processed, return current record without modifying stats
        if (sessionRepository.existsBySessionId(cleanSessionId) ||
                (existing.isPresent() && cleanSessionId.equals(existing.get().getLastSessionId()))) {
            logger.info("Duplicate submission detected for Whack Attack session ID {}. Returning existing record.", cleanSessionId);
            return WhackAttackRecordDto.fromEntity(existing.orElseGet(() -> new WhackAttackRecord(cleanBrowserId)), false);
        }

        // Server-side calculation of Accuracy: hits / (hits + misses + emptyClicks) * 100
        int totalAttempts = request.getHits() + request.getMisses() + request.getEmptyClicks();
        double serverAccuracy = 0.0;
        if (totalAttempts > 0) {
            double rawAccuracy = ((double) request.getHits() / totalAttempts) * 100.0;
            serverAccuracy = Math.round(rawAccuracy * 10.0) / 10.0;
        }

        // Persist session history
        WhackAttackSession session = new WhackAttackSession(
                cleanBrowserId,
                cleanSessionId,
                request.getDurationSeconds(),
                request.getScore(),
                request.getHits(),
                request.getMisses(),
                request.getEmptyClicks(),
                serverAccuracy,
                request.getBestCombo(),
                request.getElapsedSeconds()
        );
        sessionRepository.save(session);

        // Update or create cumulative record
        WhackAttackRecord record = existing.orElseGet(() -> new WhackAttackRecord(cleanBrowserId));
        boolean isNewPersonalBest = (record.getHighestScore() == null || request.getScore() > record.getHighestScore()) && request.getScore() > 0;

        record.setTotalGamesPlayed(record.getTotalGamesPlayed() + 1);
        record.setTotalScoreSum(record.getTotalScoreSum() + request.getScore());
        record.setTotalHits(record.getTotalHits() + request.getHits());
        record.setTotalMissedTargets(record.getTotalMissedTargets() + request.getMisses());
        record.setTotalEmptyClicks(record.getTotalEmptyClicks() + request.getEmptyClicks());
        record.setTotalAccuracySum(record.getTotalAccuracySum() + serverAccuracy);
        record.setLastSessionId(cleanSessionId);

        if (isNewPersonalBest) {
            record.setHighestScore(request.getScore());
        }

        if (record.getBestAccuracy() == null || serverAccuracy > record.getBestAccuracy()) {
            record.setBestAccuracy(serverAccuracy);
        }

        if (record.getBestCombo() == null || request.getBestCombo() > record.getBestCombo()) {
            record.setBestCombo(request.getBestCombo());
        }

        WhackAttackRecord saved = recordRepository.save(record);
        return WhackAttackRecordDto.fromEntity(saved, isNewPersonalBest);
    }

    @Transactional(readOnly = true)
    public List<WhackAttackSession> getSessionHistory(String browserId) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        return sessionRepository.findByBrowserIdOrderByCreatedAtDesc(browserId.trim());
    }

    @Transactional(readOnly = true)
    public PagedResponseDto<WhackAttackSessionDto> getSessionHistory(String browserId, int page, int size) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        if (page < 0) {
            throw new IllegalArgumentException("Page index cannot be negative");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be greater than zero");
        }
        if (size > 50) {
            throw new IllegalArgumentException("Page size cannot exceed 50");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        Page<WhackAttackSession> sessionPage = sessionRepository.findByBrowserId(browserId.trim(), pageable);
        List<WhackAttackSessionDto> dtos = sessionPage.getContent().stream()
                .map(WhackAttackSessionDto::fromEntity)
                .toList();

        return PagedResponseDto.fromPage(sessionPage, dtos);
    }
}
