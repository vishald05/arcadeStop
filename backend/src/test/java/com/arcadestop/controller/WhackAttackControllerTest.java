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
class WhackAttackControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String TEST_BROWSER_ID = "44444444-5555-4666-8777-888888888888";

    @Test
    @DisplayName("GET /api/whack-attack/records/{browserId} returns 404 when no record exists")
    void testGetRecordNotFound() throws Exception {
        mockMvc.perform(get("/api/whack-attack/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString(TEST_BROWSER_ID)));
    }

    @Test
    @DisplayName("POST /api/whack-attack/records/{browserId} creates new record on valid session")
    void testSubmitSessionSuccess() throws Exception {
        // 30s session, 20 hits, 4 misses, 1 empty click => totalAttempts = 25, accuracy = 20/25 * 100 = 80.0%
        // score = 250 (e.g. 20 * 10 + 50 combo bonus)
        String payload = """
            {
                "sessionId": "sess-wa-ctrl-1",
                "durationSeconds": 30,
                "score": 250,
                "hits": 20,
                "misses": 4,
                "emptyClicks": 1,
                "bestCombo": 7,
                "elapsedSeconds": 30.0
            }
            """;

        mockMvc.perform(post("/api/whack-attack/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.highestScore", is(250)))
                .andExpect(jsonPath("$.averageScore", is(250.0)))
                .andExpect(jsonPath("$.totalHits", is(20)))
                .andExpect(jsonPath("$.bestAccuracy", is(80.0)))
                .andExpect(jsonPath("$.averageAccuracy", is(80.0)))
                .andExpect(jsonPath("$.bestCombo", is(7)))
                .andExpect(jsonPath("$.totalMissedTargets", is(4)))
                .andExpect(jsonPath("$.totalEmptyClicks", is(1)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Verify retrieval via GET returns identical record
        mockMvc.perform(get("/api/whack-attack/records/" + TEST_BROWSER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.highestScore", is(250)))
                .andExpect(jsonPath("$.bestAccuracy", is(80.0)));
    }

    @Test
    @DisplayName("POST /api/whack-attack/records/{browserId} returns 400 on negative numbers or bad payload")
    void testSubmitSessionValidationFailure() throws Exception {
        String badPayload = """
            {
                "sessionId": "sess-wa-bad",
                "durationSeconds": 30,
                "score": -10,
                "hits": 20,
                "misses": 0,
                "emptyClicks": 0,
                "bestCombo": 5,
                "elapsedSeconds": 30.0
            }
            """;

        mockMvc.perform(post("/api/whack-attack/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badPayload))
                .andExpect(status().isBadRequest());
    }
}
