package com.arcadestop.service;

import com.arcadestop.dto.ReactionRushRecordDto;
import com.arcadestop.dto.ReactionRushSessionRequestDto;
import com.arcadestop.entity.ReactionRushRecord;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.ReactionRushRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ReactionRushService {

    // Minimum plausible human reaction ms and maximum reasonable reaction time (5000ms)
    private static final int MIN_REACTION_MS = 1;
    private static final int MAX_REASONABLE_REACTION_MS = 5000;
    private static final int REQUIRED_ATTEMPTS = 5;

    private final ReactionRushRecordRepository repository;

    public ReactionRushService(ReactionRushRecordRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ReactionRushRecordDto getRecord(String browserId) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        ReactionRushRecord record = repository.findByBrowserId(browserId.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No record found for browser ID: " + browserId));
        return ReactionRushRecordDto.fromEntity(record, false);
    }

    @Transactional
    public ReactionRushRecordDto submitSession(String browserId, ReactionRushSessionRequestDto request) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        if (request == null || request.getReactionTimes() == null) {
            throw new IllegalArgumentException("Reaction times list is required");
        }

        List<Integer> times = request.getReactionTimes();

        if (times.size() != REQUIRED_ATTEMPTS) {
            throw new IllegalArgumentException("Exactly " + REQUIRED_ATTEMPTS + " reaction times are required. Received: " + times.size());
        }

        for (Integer t : times) {
            if (t == null) {
                throw new IllegalArgumentException("Reaction time cannot be null");
            }
            if (t < MIN_REACTION_MS || t > MAX_REASONABLE_REACTION_MS) {
                throw new IllegalArgumentException(
                        "Each reaction time must be between " + MIN_REACTION_MS +
                        " and " + MAX_REASONABLE_REACTION_MS + " ms. Got: " + t);
            }
        }

        // Calculate session statistics on backend
        int sessionBest = times.stream().mapToInt(Integer::intValue).min().orElseThrow();
        int sessionAvg = (int) Math.round(times.stream().mapToInt(Integer::intValue).average().orElseThrow());

        String cleanBrowserId = browserId.trim();
        Optional<ReactionRushRecord> existing = repository.findByBrowserId(cleanBrowserId);

        boolean isNewPersonalBest;
        ReactionRushRecord record;

        if (existing.isPresent()) {
            record = existing.get();
            isNewPersonalBest = sessionBest < record.getBestReactionMs();
            if (isNewPersonalBest) {
                record.setBestReactionMs(sessionBest);
            }
            int prevTotal = record.getTotalSessions();
            int newTotal = prevTotal + 1;
            int newAvg = (int) Math.round(
                ((double) record.getAverageReactionMs() * prevTotal + sessionAvg) / newTotal
            );
            record.setAverageReactionMs(newAvg);
            record.setTotalSessions(newTotal);
        } else {
            isNewPersonalBest = true;
            record = new ReactionRushRecord(cleanBrowserId, sessionBest, sessionAvg, 1);
        }

        ReactionRushRecord saved = repository.save(record);
        return ReactionRushRecordDto.fromEntity(saved, isNewPersonalBest);
    }
}
