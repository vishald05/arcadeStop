package com.arcadestop.service;

import com.arcadestop.dto.NumberNinjaRecordDto;
import com.arcadestop.dto.NumberNinjaSessionRequestDto;
import com.arcadestop.entity.NumberNinjaRecord;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.NumberNinjaRecordRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class NumberNinjaService {

    private static final Logger logger = LoggerFactory.getLogger(NumberNinjaService.class);
    private static final int MAX_ATTEMPTS = 7;
    private static final int MIN_ATTEMPTS = 1;

    private final NumberNinjaRecordRepository repository;

    public NumberNinjaService(NumberNinjaRecordRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public NumberNinjaRecordDto getRecord(String browserId) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        NumberNinjaRecord record = repository.findByBrowserId(browserId.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No record found for browser ID: " + browserId));
        return NumberNinjaRecordDto.fromEntity(record, false);
    }

    @Transactional
    public NumberNinjaRecordDto submitSession(String browserId, NumberNinjaSessionRequestDto request) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        if (request == null) {
            throw new IllegalArgumentException("Request body cannot be null");
        }
        if (request.getSessionId() == null || request.getSessionId().trim().isEmpty()) {
            throw new IllegalArgumentException("Session ID is required for idempotency");
        }
        if (request.getWon() == null) {
            throw new IllegalArgumentException("Won flag is required");
        }
        if (request.getGuessesUsed() == null) {
            throw new IllegalArgumentException("Guesses used is required");
        }

        int guesses = request.getGuessesUsed();
        if (guesses < MIN_ATTEMPTS || guesses > MAX_ATTEMPTS) {
            throw new IllegalArgumentException(
                    "Guesses used must be between " + MIN_ATTEMPTS + " and " + MAX_ATTEMPTS + ". Got: " + guesses);
        }

        if (!request.getWon() && guesses != MAX_ATTEMPTS) {
            throw new IllegalArgumentException(
                    "A lost session must have exactly " + MAX_ATTEMPTS + " guesses. Got: " + guesses);
        }

        String cleanBrowserId = browserId.trim();
        String cleanSessionId = request.getSessionId().trim();

        Optional<NumberNinjaRecord> existing = repository.findByBrowserId(cleanBrowserId);

        // Idempotency check: if this session was already processed, return existing record
        if (existing.isPresent() && cleanSessionId.equals(existing.get().getLastSessionId())) {
            logger.info("Duplicate submission detected for session ID {}. Returning existing record without increment.", cleanSessionId);
            return NumberNinjaRecordDto.fromEntity(existing.get(), false);
        }

        boolean isNewPersonalBest = false;
        NumberNinjaRecord record;

        if (existing.isPresent()) {
            record = existing.get();
            record.setTotalGamesPlayed(record.getTotalGamesPlayed() + 1);

            if (request.getWon()) {
                record.setTotalGamesWon(record.getTotalGamesWon() + 1);
                record.setTotalGuessesInWins(record.getTotalGuessesInWins() + guesses);

                if (record.getBestGuesses() == null || guesses < record.getBestGuesses()) {
                    record.setBestGuesses(guesses);
                    isNewPersonalBest = true;
                }

                int newStreak = record.getCurrentWinStreak() + 1;
                record.setCurrentWinStreak(newStreak);
                if (newStreak > record.getBestWinStreak()) {
                    record.setBestWinStreak(newStreak);
                }
            } else {
                record.setCurrentWinStreak(0);
            }
            record.setLastSessionId(cleanSessionId);
        } else {
            record = new NumberNinjaRecord(cleanBrowserId);
            record.setTotalGamesPlayed(1);

            if (request.getWon()) {
                record.setTotalGamesWon(1);
                record.setTotalGuessesInWins(guesses);
                record.setBestGuesses(guesses);
                record.setCurrentWinStreak(1);
                record.setBestWinStreak(1);
                isNewPersonalBest = true;
            } else {
                record.setTotalGamesWon(0);
                record.setTotalGuessesInWins(0);
                record.setBestGuesses(null);
                record.setCurrentWinStreak(0);
                record.setBestWinStreak(0);
            }
            record.setLastSessionId(cleanSessionId);
        }

        NumberNinjaRecord saved = repository.save(record);
        return NumberNinjaRecordDto.fromEntity(saved, isNewPersonalBest);
    }
}
