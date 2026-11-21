package com.arcadestop.service;

import com.arcadestop.dto.MemoryMadnessOverviewDto;
import com.arcadestop.dto.MemoryMadnessRecordDto;
import com.arcadestop.dto.MemoryMadnessSessionRequestDto;
import com.arcadestop.entity.MemoryMadnessRecord;
import com.arcadestop.entity.MemoryMadnessSession;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.MemoryMadnessRecordRepository;
import com.arcadestop.repository.MemoryMadnessSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class MemoryMadnessService {

    private static final Logger logger = LoggerFactory.getLogger(MemoryMadnessService.class);
    private static final Set<String> ALLOWED_DIFFICULTIES = Set.of("EASY", "MEDIUM", "HARD");
    private static final Map<String, Integer> REQUIRED_PAIRS = Map.of(
            "EASY", 8,
            "MEDIUM", 18,
            "HARD", 32
    );

    private final MemoryMadnessRecordRepository recordRepository;
    private final MemoryMadnessSessionRepository sessionRepository;

    public MemoryMadnessService(MemoryMadnessRecordRepository recordRepository,
                                MemoryMadnessSessionRepository sessionRepository) {
        this.recordRepository = recordRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public MemoryMadnessOverviewDto getOverview(String browserId) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        String cleanBrowserId = browserId.trim();
        List<MemoryMadnessRecord> records = recordRepository.findByBrowserId(cleanBrowserId);

        MemoryMadnessRecordDto easy = null;
        MemoryMadnessRecordDto medium = null;
        MemoryMadnessRecordDto hard = null;

        for (MemoryMadnessRecord rec : records) {
            if ("EASY".equalsIgnoreCase(rec.getDifficulty())) {
                easy = MemoryMadnessRecordDto.fromEntity(rec, false);
            } else if ("MEDIUM".equalsIgnoreCase(rec.getDifficulty())) {
                medium = MemoryMadnessRecordDto.fromEntity(rec, false);
            } else if ("HARD".equalsIgnoreCase(rec.getDifficulty())) {
                hard = MemoryMadnessRecordDto.fromEntity(rec, false);
            }
        }

        return new MemoryMadnessOverviewDto(cleanBrowserId, easy, medium, hard);
    }

    @Transactional(readOnly = true)
    public MemoryMadnessRecordDto getRecord(String browserId, String difficulty) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        if (difficulty == null || !ALLOWED_DIFFICULTIES.contains(difficulty.trim().toUpperCase())) {
            throw new IllegalArgumentException("Difficulty must be one of: EASY, MEDIUM, HARD");
        }
        String cleanBrowserId = browserId.trim();
        String cleanDifficulty = difficulty.trim().toUpperCase();

        MemoryMadnessRecord record = recordRepository.findByBrowserIdAndDifficulty(cleanBrowserId, cleanDifficulty)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No record found for browser ID: " + cleanBrowserId + " and difficulty: " + cleanDifficulty));
        return MemoryMadnessRecordDto.fromEntity(record, false);
    }

    @Transactional
    public MemoryMadnessRecordDto submitSession(String browserId, MemoryMadnessSessionRequestDto request) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        if (request == null) {
            throw new IllegalArgumentException("Request body cannot be null");
        }
        if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
            throw new IllegalArgumentException("Session ID is required for idempotency");
        }
        if (request.getDifficulty() == null || !ALLOWED_DIFFICULTIES.contains(request.getDifficulty().trim().toUpperCase())) {
            throw new IllegalArgumentException("Difficulty must be one of: EASY, MEDIUM, HARD");
        }
        if (request.getScore() == null || request.getScore() < 0) {
            throw new IllegalArgumentException("Score must be a non-negative integer");
        }
        if (request.getCompletionTimeSeconds() == null || request.getCompletionTimeSeconds() <= 0.0) {
            throw new IllegalArgumentException("Completion time must be greater than zero");
        }
        if (request.getTotalMoves() == null || request.getTotalMoves() < 1) {
            throw new IllegalArgumentException("Total moves must be at least 1");
        }
        if (request.getMatchedPairs() == null || request.getMatchedPairs() < 1) {
            throw new IllegalArgumentException("Matched pairs must be at least 1");
        }
        if (request.getMismatchedAttempts() == null || request.getMismatchedAttempts() < 0) {
            throw new IllegalArgumentException("Mismatched attempts must be a non-negative integer");
        }

        String cleanDifficulty = request.getDifficulty().trim().toUpperCase();
        int expectedPairs = REQUIRED_PAIRS.get(cleanDifficulty);
        if (request.getMatchedPairs() != expectedPairs) {
            throw new IllegalArgumentException("Matched pairs (" + request.getMatchedPairs() + ") must equal required pairs (" + expectedPairs + ") for " + cleanDifficulty + " mode");
        }

        if (request.getTotalMoves() < request.getMatchedPairs()) {
            throw new IllegalArgumentException("Total moves cannot be less than total matched pairs");
        }

        if (request.getMismatchedAttempts() != request.getTotalMoves() - request.getMatchedPairs()) {
            throw new IllegalArgumentException("Mismatched attempts must equal total moves minus matched pairs");
        }

        // Server-calculated accuracy
        double rawAccuracy = ((double) request.getMatchedPairs() / request.getTotalMoves()) * 100.0;
        double serverAccuracy = Math.round(rawAccuracy * 10.0) / 10.0;

        String cleanBrowserId = browserId.trim();
        String cleanSessionId = request.getSessionId().trim();

        Optional<MemoryMadnessRecord> existing = recordRepository.findByBrowserIdAndDifficulty(cleanBrowserId, cleanDifficulty);

        // Idempotency check: if session was already processed, return current record without modifying stats
        if (sessionRepository.existsBySessionId(cleanSessionId) ||
                (existing.isPresent() && cleanSessionId.equals(existing.get().getLastSessionId()))) {
            logger.info("Duplicate submission detected for Memory Madness session ID {}. Returning existing record.", cleanSessionId);
            return MemoryMadnessRecordDto.fromEntity(existing.orElseGet(() -> new MemoryMadnessRecord(cleanBrowserId, cleanDifficulty)), false);
        }

        // Persist session history
        MemoryMadnessSession session = new MemoryMadnessSession(
                cleanBrowserId,
                cleanSessionId,
                cleanDifficulty,
                request.getScore(),
                request.getCompletionTimeSeconds(),
                request.getTotalMoves(),
                request.getMatchedPairs(),
                request.getMismatchedAttempts(),
                serverAccuracy
        );
        sessionRepository.save(session);

        // Update or create cumulative record for this specific difficulty
        MemoryMadnessRecord record = existing.orElseGet(() -> new MemoryMadnessRecord(cleanBrowserId, cleanDifficulty));
        boolean isNewPersonalBest = (record.getBestScore() == null || request.getScore() > record.getBestScore()) && request.getScore() > 0;

        record.setTotalGamesPlayed(record.getTotalGamesPlayed() + 1);
        record.setTotalScoreSum(record.getTotalScoreSum() + request.getScore());
        record.setTotalCompletionTimeSum(record.getTotalCompletionTimeSum() + request.getCompletionTimeSeconds());
        record.setTotalMoveCountSum(record.getTotalMoveCountSum() + request.getTotalMoves());
        record.setTotalAccuracySum(record.getTotalAccuracySum() + serverAccuracy);
        record.setTotalPairsMatched(record.getTotalPairsMatched() + request.getMatchedPairs());
        record.setLastSessionId(cleanSessionId);

        if (isNewPersonalBest) {
            record.setBestScore(request.getScore());
        }

        if (record.getBestCompletionTime() == null || request.getCompletionTimeSeconds() < record.getBestCompletionTime()) {
            record.setBestCompletionTime(request.getCompletionTimeSeconds());
        }

        if (record.getBestMoveCount() == null || request.getTotalMoves() < record.getBestMoveCount()) {
            record.setBestMoveCount(request.getTotalMoves());
        }

        if (record.getBestAccuracy() == null || serverAccuracy > record.getBestAccuracy()) {
            record.setBestAccuracy(serverAccuracy);
        }

        MemoryMadnessRecord saved = recordRepository.save(record);
        return MemoryMadnessRecordDto.fromEntity(saved, isNewPersonalBest);
    }
}
