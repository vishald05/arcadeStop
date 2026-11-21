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
class SequenceMasterControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String TEST_BROWSER_ID = "55555555-6666-4777-8888-999999999999";

    @Test
    @DisplayName("GET /api/sequence-master/records/{browserId} returns overview with null modes initially")
    void testGetOverviewEmpty() throws Exception {
        mockMvc.perform(get("/api/sequence-master/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.easy", nullValue()))
                .andExpect(jsonPath("$.medium", nullValue()))
                .andExpect(jsonPath("$.hard", nullValue()));
    }

    @Test
    @DisplayName("POST /api/sequence-master/records/{browserId} creates new record and can be retrieved")
    void testSubmitSessionSuccess() throws Exception {
        // 2 completed rounds: round 1 (100) + round 2 (110) = 210 pts, seq length = 3, correct tiles = 3
        String payload = """
            {
                "sessionId": "sess-sm-ctrl-1",
                "difficulty": "MEDIUM",
                "score": 210,
                "highestSequenceLength": 3,
                "completedRounds": 2,
                "totalCorrectTiles": 3,
                "elapsedSeconds": 18.5
            }
            """;

        mockMvc.perform(post("/api/sequence-master/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.difficulty", is("MEDIUM")))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.highestScore", is(210)))
                .andExpect(jsonPath("$.highestSequenceLength", is(3)))
                .andExpect(jsonPath("$.totalCompletedRounds", is(2)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Verify retrieval via GET specific difficulty
        mockMvc.perform(get("/api/sequence-master/records/" + TEST_BROWSER_ID + "/MEDIUM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.difficulty", is("MEDIUM")))
                .andExpect(jsonPath("$.highestScore", is(210)));

        // Verify retrieval via overview includes medium
        mockMvc.perform(get("/api/sequence-master/records/" + TEST_BROWSER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.medium.highestScore", is(210)))
                .andExpect(jsonPath("$.easy", nullValue()));
    }

    @Test
    @DisplayName("POST /api/sequence-master/records/{browserId} returns 400 on invalid payload")
    void testSubmitSessionValidationFailure() throws Exception {
        String badPayload = """
            {
                "sessionId": "sess-sm-bad",
                "difficulty": "INVALID",
                "score": -5,
                "highestSequenceLength": 0,
                "completedRounds": -1,
                "totalCorrectTiles": -1,
                "elapsedSeconds": 0
            }
            """;

        mockMvc.perform(post("/api/sequence-master/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(badPayload))
                .andExpect(status().isBadRequest());
    }
}
