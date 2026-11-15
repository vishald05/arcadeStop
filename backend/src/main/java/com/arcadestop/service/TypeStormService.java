package com.arcadestop.service;

import com.arcadestop.dto.TypeStormRecordDto;
import com.arcadestop.dto.TypeStormSessionRequestDto;
import com.arcadestop.entity.TypeStormRecord;
import com.arcadestop.entity.TypeStormSession;
import com.arcadestop.exception.ResourceNotFoundException;
import com.arcadestop.repository.TypeStormRecordRepository;
import com.arcadestop.repository.TypeStormSessionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TypeStormService {

    private static final Logger logger = LoggerFactory.getLogger(TypeStormService.class);
    private static final Set<Integer> ALLOWED_DURATIONS = Set.of(15, 30, 60);

    private final TypeStormRecordRepository recordRepository;
    private final TypeStormSessionRepository sessionRepository;

    public TypeStormService(TypeStormRecordRepository recordRepository,
                            TypeStormSessionRepository sessionRepository) {
        this.recordRepository = recordRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public TypeStormRecordDto getRecord(String browserId) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        TypeStormRecord record = recordRepository.findByBrowserId(browserId.trim())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No record found for browser ID: " + browserId));
        return TypeStormRecordDto.fromEntity(record, false);
    }

    @Transactional
    public TypeStormRecordDto submitSession(String browserId, TypeStormSessionRequestDto request) {
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
            throw new IllegalArgumentException("Duration must be one of: 15, 30, 60 seconds");
        }
        if (request.getCorrectCharacters() == null || request.getCorrectCharacters() < 0) {
            throw new IllegalArgumentException("Correct characters must be a non-negative integer");
        }
        if (request.getIncorrectCharacters() == null || request.getIncorrectCharacters() < 0) {
            throw new IllegalArgumentException("Incorrect characters must be a non-negative integer");
        }
        if (request.getTotalCharactersTyped() == null || request.getTotalCharactersTyped() < 0) {
            throw new IllegalArgumentException("Total characters typed must be a non-negative integer");
        }
        if (request.getTotalCharactersTyped() < request.getCorrectCharacters()) {
            throw new IllegalArgumentException("Total characters typed cannot be less than correct characters");
        }
        if (request.getElapsedSeconds() == null || request.getElapsedSeconds() <= 0.0) {
            throw new IllegalArgumentException("Elapsed seconds must be greater than zero");
        }
        if (request.getElapsedSeconds() > request.getDurationSeconds() + 10.0) {
            throw new IllegalArgumentException("Elapsed time exceeds maximum allowed session duration");
        }

        String cleanBrowserId = browserId.trim();
        String cleanSessionId = request.getSessionId().trim();

        Optional<TypeStormRecord> existing = recordRepository.findByBrowserId(cleanBrowserId);

        // Idempotency check: if session was already processed, return current record without modifying stats
        if (sessionRepository.existsBySessionId(cleanSessionId) ||
                (existing.isPresent() && cleanSessionId.equals(existing.get().getLastSessionId()))) {
            logger.info("Duplicate submission detected for TypeStorm session ID {}. Returning existing record.", cleanSessionId);
            return TypeStormRecordDto.fromEntity(existing.orElseGet(() -> new TypeStormRecord(cleanBrowserId)), false);
        }

        // Server-side calculation of official WPM and Accuracy
        double elapsedMinutes = Math.max(0.1, request.getElapsedSeconds()) / 60.0;
        int serverWpm = (int) Math.round((request.getCorrectCharacters() / 5.0) / elapsedMinutes);

        double serverAccuracy = 100.0;
        if (request.getTotalCharactersTyped() > 0) {
            double rawAccuracy = ((double) request.getCorrectCharacters() / request.getTotalCharactersTyped()) * 100.0;
            serverAccuracy = Math.round(rawAccuracy * 10.0) / 10.0;
        }

        // Persist session history
        TypeStormSession session = new TypeStormSession(
                cleanBrowserId,
                cleanSessionId,
                request.getDurationSeconds(),
                serverWpm,
                serverAccuracy,
                request.getCorrectCharacters(),
                request.getIncorrectCharacters(),
                request.getTotalCharactersTyped(),
                request.getElapsedSeconds()
        );
        sessionRepository.save(session);

        // Update or create cumulative record
        TypeStormRecord record = existing.orElseGet(() -> new TypeStormRecord(cleanBrowserId));
        boolean isNewPersonalBest = (record.getBestWpm() == null || serverWpm > record.getBestWpm()) && serverWpm > 0;

        record.setTotalGamesPlayed(record.getTotalGamesPlayed() + 1);
        record.setTotalWpmSum(record.getTotalWpmSum() + serverWpm);
        record.setTotalAccuracySum(record.getTotalAccuracySum() + serverAccuracy);
        record.setTotalCharactersTyped(record.getTotalCharactersTyped() + request.getTotalCharactersTyped());
        record.setTotalMistakes(record.getTotalMistakes() + request.getIncorrectCharacters());
        record.setLastSessionId(cleanSessionId);

        if (isNewPersonalBest) {
            record.setBestWpm(serverWpm);
        }

        if (record.getBestAccuracy() == null || serverAccuracy > record.getBestAccuracy()) {
            record.setBestAccuracy(serverAccuracy);
        }

        TypeStormRecord saved = recordRepository.save(record);
        return TypeStormRecordDto.fromEntity(saved, isNewPersonalBest);
    }

    @Transactional(readOnly = true)
    public List<TypeStormSession> getSessionHistory(String browserId) {
        if (browserId == null || browserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Browser ID cannot be blank");
        }
        return sessionRepository.findByBrowserIdOrderByCreatedAtDesc(browserId.trim());
    }
}
