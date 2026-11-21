package com.arcadestop.service;

import com.arcadestop.dto.SequenceMasterOverviewDto;
import com.arcadestop.dto.SequenceMasterRecordDto;
import com.arcadestop.dto.SequenceMasterSessionRequestDto;
import com.arcadestop.entity.SequenceMasterRecord;
import com.arcadestop.entity.SequenceMasterSession;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.SequenceMasterRecordRepository;
import com.arcadestop.repository.SequenceMasterSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class SequenceMasterService {

    private static final Logger logger = LoggerFactory.getLogger(SequenceMasterService.class);
    private static final Set<String> ALLOWED_DIFFICULTIES = Set.of("EASY", "MEDIUM", "HARD");

    private final SequenceMasterRecordRepository recordRepository;
    private final SequenceMasterSessionRepository sessionRepository;

    public SequenceMasterService(SequenceMasterRecordRepository recordRepository,
                                 SequenceMasterSessionRepository sessionRepository) {
        this.recordRepository = recordRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public SequenceMasterOverviewDto getOverview(String browserId) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        String cleanBrowserId = browserId.trim();
        List<SequenceMasterRecord> records = recordRepository.findByBrowserId(cleanBrowserId);

        SequenceMasterRecordDto easy = null;
        SequenceMasterRecordDto medium = null;
        SequenceMasterRecordDto hard = null;

        for (SequenceMasterRecord rec : records) {
            if ("EASY".equalsIgnoreCase(rec.getDifficulty())) {
                easy = SequenceMasterRecordDto.fromEntity(rec, false);
            } else if ("MEDIUM".equalsIgnoreCase(rec.getDifficulty())) {
                medium = SequenceMasterRecordDto.fromEntity(rec, false);
            } else if ("HARD".equalsIgnoreCase(rec.getDifficulty())) {
                hard = SequenceMasterRecordDto.fromEntity(rec, false);
            }
        }

        return new SequenceMasterOverviewDto(cleanBrowserId, easy, medium, hard);
    }

    @Transactional(readOnly = true)
    public SequenceMasterRecordDto getRecord(String browserId, String difficulty) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        if (difficulty == null || !ALLOWED_DIFFICULTIES.contains(difficulty.trim().toUpperCase())) {
            throw new IllegalArgumentException("Difficulty must be one of: EASY, MEDIUM, HARD");
        }
        String cleanBrowserId = browserId.trim();
        String cleanDifficulty = difficulty.trim().toUpperCase();

        SequenceMasterRecord record = recordRepository.findByBrowserIdAndDifficulty(cleanBrowserId, cleanDifficulty)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No record found for browser ID: " + cleanBrowserId + " and difficulty: " + cleanDifficulty));
        return SequenceMasterRecordDto.fromEntity(record, false);
    }

    @Transactional
    public SequenceMasterRecordDto submitSession(String browserId, SequenceMasterSessionRequestDto request) {
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
        if (request.getCompletedRounds() == null || request.getCompletedRounds() < 0) {
            throw new IllegalArgumentException("Completed rounds must be a non-negative integer");
        }
        if (request.getHighestSequenceLength() == null || request.getHighestSequenceLength() < 1) {
            throw new IllegalArgumentException("Highest sequence length must be at least 1");
        }
        if (request.getTotalCorrectTiles() == null || request.getTotalCorrectTiles() < 0) {
            throw new IllegalArgumentException("Total correct tiles must be a non-negative integer");
        }
        if (request.getElapsedSeconds() == null || request.getElapsedSeconds() <= 0.0) {
            throw new IllegalArgumentException("Elapsed seconds must be greater than zero");
        }

        // Logic validation: sequence length must be at least completed rounds
        if (request.getHighestSequenceLength() < request.getCompletedRounds()) {
            throw new IllegalArgumentException("Highest sequence length cannot be less than completed rounds");
        }

        // Total correct tiles validation:
        // Each completed round i requires i correct clicks: sum(i=1..completedRounds) = N(N+1)/2
        int minCorrectTiles = (request.getCompletedRounds() * (request.getCompletedRounds() + 1)) / 2;
        if (request.getTotalCorrectTiles() < minCorrectTiles) {
            throw new IllegalArgumentException("Total correct tiles is less than required for completed rounds");
        }

        // Score validation:
        // Round completion formula: sum(i=1..N) (100 + 10*(i-1)) = 100*N + 5*N*(N-1)
        int expectedScore = 0;
        int n = request.getCompletedRounds();
        if (n > 0) {
            expectedScore = (100 * n) + (5 * n * (n - 1));
        }
        if (request.getScore() != expectedScore) {
            throw new IllegalArgumentException("Reported score (" + request.getScore() + ") does not match expected score (" + expectedScore + ") for completed rounds");
        }

        String cleanBrowserId = browserId.trim();
        String cleanSessionId = request.getSessionId().trim();
        String cleanDifficulty = request.getDifficulty().trim().toUpperCase();

        Optional<SequenceMasterRecord> existing = recordRepository.findByBrowserIdAndDifficulty(cleanBrowserId, cleanDifficulty);

        // Idempotency check: if session was already processed, return current record without modifying stats
        if (sessionRepository.existsBySessionId(cleanSessionId) ||
                (existing.isPresent() && cleanSessionId.equals(existing.get().getLastSessionId()))) {
            logger.info("Duplicate submission detected for Sequence Master session ID {}. Returning existing record.", cleanSessionId);
            return SequenceMasterRecordDto.fromEntity(existing.orElseGet(() -> new SequenceMasterRecord(cleanBrowserId, cleanDifficulty)), false);
        }

        // Persist session history
        SequenceMasterSession session = new SequenceMasterSession(
                cleanBrowserId,
                cleanSessionId,
                cleanDifficulty,
                request.getScore(),
                request.getHighestSequenceLength(),
                request.getCompletedRounds(),
                request.getTotalCorrectTiles(),
                request.getElapsedSeconds()
        );
        sessionRepository.save(session);

        // Update or create cumulative record for this specific difficulty
        SequenceMasterRecord record = existing.orElseGet(() -> new SequenceMasterRecord(cleanBrowserId, cleanDifficulty));
        boolean isNewPersonalBest = (record.getHighestScore() == null || request.getScore() > record.getHighestScore()) && request.getScore() > 0;

        record.setTotalGamesPlayed(record.getTotalGamesPlayed() + 1);
        record.setTotalScoreSum(record.getTotalScoreSum() + request.getScore());
        record.setTotalSequenceLengthSum(record.getTotalSequenceLengthSum() + request.getHighestSequenceLength());
        record.setTotalCompletedRounds(record.getTotalCompletedRounds() + request.getCompletedRounds());
        record.setTotalCorrectTileInputs(record.getTotalCorrectTileInputs() + request.getTotalCorrectTiles());
        record.setLastSessionId(cleanSessionId);

        if (isNewPersonalBest) {
            record.setHighestScore(request.getScore());
        }

        if (record.getHighestSequenceLength() == null || request.getHighestSequenceLength() > record.getHighestSequenceLength()) {
            record.setHighestSequenceLength(request.getHighestSequenceLength());
        }

        SequenceMasterRecord saved = recordRepository.save(record);
        return SequenceMasterRecordDto.fromEntity(saved, isNewPersonalBest);
    }
}
