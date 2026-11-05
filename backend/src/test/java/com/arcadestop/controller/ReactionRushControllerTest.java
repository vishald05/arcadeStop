package com.arcadestop.controller;

import com.arcadestop.repository.ReactionRushRecordRepository;
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
class ReactionRushControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ReactionRushRecordRepository repository;

    private static final String TEST_BROWSER_ID = "987e6543-e21b-12d3-a456-426614174999";

    @Test
    @DisplayName("GET /api/reaction-rush/records/{browserId} returns 404 when no record exists")
    void testGetRecordNotFound() throws Exception {
        mockMvc.perform(get("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString(TEST_BROWSER_ID)));
    }

    @Test
    @DisplayName("POST /api/reaction-rush/records/{browserId} creates new record on valid 5 attempts")
    void testSubmitSessionNewRecordSuccess() throws Exception {
        String payload = "{\"reactionTimes\": [230, 240, 250, 220, 260]}";

        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.bestReactionMs", is(220)))
                .andExpect(jsonPath("$.averageReactionMs", is(240)))
                .andExpect(jsonPath("$.totalSessions", is(1)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Verify retrieval via GET returns same record
        mockMvc.perform(get("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.bestReactionMs", is(220)))
                .andExpect(jsonPath("$.totalSessions", is(1)));
    }

    @Test
    @DisplayName("Consecutive POSTs update totalSessions, personal best, and rolling average")
    void testConsecutiveSubmissions() throws Exception {
        // Session 1: best 250, avg 260
        String payload1 = "{\"reactionTimes\": [250, 260, 270, 260, 260]}";
        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSessions", is(1)))
                .andExpect(jsonPath("$.bestReactionMs", is(250)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Session 2 with faster times: best 210, avg 230 -> new PB!
        String payload2 = "{\"reactionTimes\": [210, 220, 230, 240, 250]}";
        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSessions", is(2)))
                .andExpect(jsonPath("$.bestReactionMs", is(210)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Session 3 with slower times: best 300, avg 320 -> not a PB, totalSessions = 3
        String payload3 = "{\"reactionTimes\": [300, 310, 320, 330, 340]}";
        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload3))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSessions", is(3)))
                .andExpect(jsonPath("$.bestReactionMs", is(210)))
                .andExpect(jsonPath("$.newPersonalBest", is(false)));
    }

    @Test
    @DisplayName("POST rejects less than 5 reaction times with 400 Bad Request")
    void testSubmitSessionTooFewAttempts() throws Exception {
        String payload = "{\"reactionTimes\": [200, 210, 220, 230]}";

        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")));
    }

    @Test
    @DisplayName("POST rejects more than 5 reaction times with 400 Bad Request")
    void testSubmitSessionTooManyAttempts() throws Exception {
        String payload = "{\"reactionTimes\": [200, 210, 220, 230, 240, 250]}";

        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.error", is("Bad Request")));
    }

    @Test
    @DisplayName("POST rejects 0 or negative reaction times with 400 Bad Request")
    void testSubmitSessionInvalidValues() throws Exception {
        String zeroPayload = "{\"reactionTimes\": [200, 0, 220, 230, 240]}";
        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(zeroPayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("between 1 and 5000 ms")));

        String negativePayload = "{\"reactionTimes\": [200, -50, 220, 230, 240]}";
        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(negativePayload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("between 1 and 5000 ms")));
    }

    @Test
    @DisplayName("POST rejects reaction times exceeding 5000ms with 400 Bad Request")
    void testSubmitSessionValueExceedsMax() throws Exception {
        String payload = "{\"reactionTimes\": [200, 5001, 220, 230, 240]}";

        mockMvc.perform(post("/api/reaction-rush/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("between 1 and 5000 ms")));
    }
}
