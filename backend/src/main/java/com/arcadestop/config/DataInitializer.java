package com.arcadestop.config;

import com.arcadestop.entity.Game;
import com.arcadestop.entity.GameStatus;
import com.arcadestop.repository.GameRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final GameRepository gameRepository;

    public DataInitializer(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Override
    public void run(String... args) {
        logger.info("Checking initial game catalog data...");

        List<Game> seedGames = List.of(
            new Game(
                "Reaction Rush",
                "reaction-rush",
                "Test your reflexes. Wait for the signal and click as fast as you can.",
                "Reflex",
                "zap",
                GameStatus.AVAILABLE,
                true
            ),
            new Game(
                "Memory Madness",
                "memory-madness",
                "Flip the cards, find matching pairs, and challenge your memory.",
                "Brain",
                "brain",
                GameStatus.COMING_SOON,
                false
            ),
            new Game(
                "Number Ninja",
                "number-ninja",
                "Guess the hidden number using clues before you run out of attempts.",
                "Puzzle",
                "hash",
                GameStatus.AVAILABLE,
                false
            ),
            new Game(
                "TypeStorm",
                "type-storm",
                "Test your typing speed, accuracy, and precision.",
                "Skills",
                "keyboard",
                GameStatus.COMING_SOON,
                false
            ),
            new Game(
                "Sequence Master",
                "sequence-master",
                "Watch the sequence, remember the pattern, and repeat it correctly.",
                "Memory",
                "palette",
                GameStatus.COMING_SOON,
                false
            ),
            new Game(
                "Whack Attack",
                "whack-attack",
                "Targets appear randomly. Hit as many as possible before time runs out.",
                "Reflex",
                "target",
                GameStatus.COMING_SOON,
                false
            )
        );

        int addedCount = 0;
        int updatedCount = 0;
        for (Game seedGame : seedGames) {
            java.util.Optional<Game> existing = gameRepository.findBySlug(seedGame.getSlug());
            if (existing.isEmpty()) {
                gameRepository.save(seedGame);
                addedCount++;
                logger.info("Seeded game: {}", seedGame.getName());
            } else {
                Game game = existing.get();
                if (game.getStatus() != seedGame.getStatus()) {
                    logger.info("Updating status for existing game '{}' from {} to {}",
                            game.getName(), game.getStatus(), seedGame.getStatus());
                    game.setStatus(seedGame.getStatus());
                    gameRepository.save(game);
                    updatedCount++;
                }
            }
        }

        if (addedCount > 0 || updatedCount > 0) {
            logger.info("Catalog sync complete. Added: {}, Updated: {}", addedCount, updatedCount);
        } else {
            logger.info("All seed games already exist with up-to-date statuses. No changes made.");
        }
    }
}
