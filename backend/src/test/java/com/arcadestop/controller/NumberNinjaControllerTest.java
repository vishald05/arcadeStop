package com.arcadestop.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class NumberNinjaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String TEST_BROWSER_ID = "11111111-2222-4333-8444-555555555555";

    @Test
    @DisplayName("GET /api/number-ninja/records/{browserId} returns 404 when no record exists")
    void testGetRecordNotFound() throws Exception {
        mockMvc.perform(get("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString(TEST_BROWSER_ID)));
    }

    @Test
    @DisplayName("POST /api/number-ninja/records/{browserId} creates new record on winning session")
    void testSubmitSessionNewRecordSuccess() throws Exception {
        String payload = "{\"sessionId\": \"sess-1\", \"won\": true, \"guessesUsed\": 4}";

        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.totalGamesWon", is(1)))
                .andExpect(jsonPath("$.totalGuessesInWins", is(4)))
                .andExpect(jsonPath("$.bestGuesses", is(4)))
                .andExpect(jsonPath("$.currentWinStreak", is(1)))
                .andExpect(jsonPath("$.bestWinStreak", is(1)))
                .andExpect(jsonPath("$.winPercentage", is(100.0)))
                .andExpect(jsonPath("$.averageGuessesPerWin", is(4.0)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Verify retrieval via GET returns same record
        mockMvc.perform(get("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.bestGuesses", is(4)));
    }

    @Test
    @DisplayName("Duplicate POST with same sessionId is idempotent and does not increment games played")
    void testSubmitSessionIdempotency() throws Exception {
        String payload = "{\"sessionId\": \"sess-idem\", \"won\": true, \"guessesUsed\": 3}";

        // First submission
        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.totalGamesWon", is(1)));

        // Immediate retry with identical sessionId
        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGamesPlayed", is(1))) // still 1!
                .andExpect(jsonPath("$.totalGamesWon", is(1)));
    }

    @Test
    @DisplayName("Consecutive POSTs update statistics and handle loss streak reset")
    void testConsecutiveSubmissions() throws Exception {
        // Session 1: Win with 5 guesses
        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\": \"s-1\", \"won\": true, \"guessesUsed\": 5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.bestGuesses", is(5)))
                .andExpect(jsonPath("$.currentWinStreak", is(1)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Session 2: Win with 3 guesses -> new bestGuesses and streak = 2
        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\": \"s-2\", \"won\": true, \"guessesUsed\": 3}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGamesPlayed", is(2)))
                .andExpect(jsonPath("$.bestGuesses", is(3)))
                .andExpect(jsonPath("$.currentWinStreak", is(2)))
                .andExpect(jsonPath("$.bestWinStreak", is(2)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Session 3: Loss (exhausted 7 guesses) -> streak resets to 0, bestWinStreak stays 2
        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\": \"s-3\", \"won\": false, \"guessesUsed\": 7}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGamesPlayed", is(3)))
                .andExpect(jsonPath("$.totalGamesWon", is(2)))
                .andExpect(jsonPath("$.currentWinStreak", is(0)))
                .andExpect(jsonPath("$.bestWinStreak", is(2)))
                .andExpect(jsonPath("$.winPercentage", is(66.7)))
                .andExpect(jsonPath("$.averageGuessesPerWin", is(4.0))) // (5 + 3) / 2 = 4.0
                .andExpect(jsonPath("$.newPersonalBest", is(false)));
    }

    @Test
    @DisplayName("POST rejects out-of-range guesses with 400 Bad Request")
    void testRejectOutOfRangeGuesses() throws Exception {
        // Guesses > 7
        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\": \"s-err-1\", \"won\": true, \"guessesUsed\": 8}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));

        // Guesses < 1
        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\": \"s-err-2\", \"won\": true, \"guessesUsed\": 0}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    @Test
    @DisplayName("POST rejects lost session with fewer than 7 guesses")
    void testRejectInvalidLossGuesses() throws Exception {
        mockMvc.perform(post("/api/number-ninja/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"sessionId\": \"s-err-3\", \"won\": false, \"guessesUsed\": 5}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("lost session must have exactly 7 guesses")));
    }
}
