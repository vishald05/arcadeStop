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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
class MemoryMadnessControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String TEST_BROWSER_ID = "66666666-7777-4888-9999-000000000000";

    @Test
    @DisplayName("GET /api/memory-madness/records/{browserId} returns overview with null difficulties initially")
    void testGetOverviewEmpty() throws Exception {
        mockMvc.perform(get("/api/memory-madness/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.easy", nullValue()))
                .andExpect(jsonPath("$.medium", nullValue()))
                .andExpect(jsonPath("$.hard", nullValue()));
    }

    @Test
    @DisplayName("POST /api/memory-madness/records/{browserId} creates new record on valid session")
    void testSubmitSessionSuccess() throws Exception {
        // Easy mode: 8 pairs matched in 12 moves (8 matches, 4 mismatches) -> accuracy = 8/12 = 66.7%
        String payload = """
            {
                "sessionId": "sess-mm-ctrl-1",
                "difficulty": "EASY",
                "score": 980,
                "completionTimeSeconds": 42.0,
                "totalMoves": 12,
                "matchedPairs": 8,
                "mismatchedAttempts": 4,
                "accuracy": 66.7
            }
            """;

        mockMvc.perform(post("/api/memory-madness/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.difficulty", is("EASY")))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.bestScore", is(980)))
                .andExpect(jsonPath("$.bestCompletionTime", is(42.0)))
                .andExpect(jsonPath("$.bestMoveCount", is(12)))
                .andExpect(jsonPath("$.bestAccuracy", is(66.7)))
                .andExpect(jsonPath("$.totalPairsMatched", is(8)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Verify retrieval via GET specific difficulty
        mockMvc.perform(get("/api/memory-madness/records/" + TEST_BROWSER_ID + "/EASY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.difficulty", is("EASY")))
                .andExpect(jsonPath("$.bestScore", is(980)));

        // Verify retrieval via overview includes easy
        mockMvc.perform(get("/api/memory-madness/records/" + TEST_BROWSER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.easy.bestScore", is(980)))
                .andExpect(jsonPath("$.medium", nullValue()));
    }

    @Test
    @DisplayName("POST /api/memory-madness/records/{browserId} returns 400 on invalid payload")
    void testSubmitSessionValidationFailure() throws Exception {
        String badPayload = """
            {
                "sessionId": "sess-mm-bad",
                "difficulty": "INVALID",
                "score": -10,
                "completionTimeSeconds": 0,
                "totalMoves": 0,
                "matchedPairs": 0,
                "mismatchedAttempts": -1,
                "accuracy": -5.0
            }
            """;

        mockMvc.perform(post("/api/memory-madness/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badPayload))
                .andExpect(status().isBadRequest());
    }
}
