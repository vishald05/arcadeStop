package com.arcadestop.controller;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
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
class TypeStormControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String TEST_BROWSER_ID = "33333333-4444-4555-8666-777777777777";

    @Test
    @DisplayName("GET /api/type-storm/records/{browserId} returns 404 when no record exists")
    void testGetRecordNotFound() throws Exception {
        mockMvc.perform(get("/api/type-storm/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString(TEST_BROWSER_ID)));
    }

    @Test
    @DisplayName("POST /api/type-storm/records/{browserId} creates new record on valid session")
    void testSubmitSessionSuccess() throws Exception {
        // 30 seconds, 150 correct chars, 10 mistakes -> 160 total typed, 30.0 elapsed
        // WPM = (150 / 5) / 0.5 = 60
        // Accuracy = (150 / 160) * 100 = 93.8%
        String payload = """
            {
                "sessionId": "sess-ts-1",
                "durationSeconds": 30,
                "correctCharacters": 150,
                "incorrectCharacters": 10,
                "totalCharactersTyped": 160,
                "elapsedSeconds": 30.0
            }
            """;

        mockMvc.perform(post("/api/type-storm/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.bestWpm", is(60)))
                .andExpect(jsonPath("$.averageWpm", is(60.0)))
                .andExpect(jsonPath("$.bestAccuracy", is(93.8)))
                .andExpect(jsonPath("$.averageAccuracy", is(93.8)))
                .andExpect(jsonPath("$.totalCharactersTyped", is(160)))
                .andExpect(jsonPath("$.totalMistakes", is(10)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Verify retrieval via GET returns identical record
        mockMvc.perform(get("/api/type-storm/records/" + TEST_BROWSER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.browserId", is(TEST_BROWSER_ID)))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.bestWpm", is(60)))
                .andExpect(jsonPath("$.averageWpm", is(60.0)));
    }

    @Test
    @DisplayName("POST /api/type-storm/records/{browserId} handles duplicate submission idempotently")
    void testSubmitSessionIdempotency() throws Exception {
        String payload = """
            {
                "sessionId": "sess-duplicate",
                "durationSeconds": 15,
                "correctCharacters": 50,
                "incorrectCharacters": 0,
                "totalCharactersTyped": 50,
                "elapsedSeconds": 15.0
            }
            """;

        // First submission
        mockMvc.perform(post("/api/type-storm/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.newPersonalBest", is(true)));

        // Duplicate submission with same sessionId
        mockMvc.perform(post("/api/type-storm/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)))
                .andExpect(jsonPath("$.newPersonalBest", is(false)));
    }

    @Test
    @DisplayName("POST /api/type-storm/records/{browserId} rejects invalid duration with 400 Bad Request")
    void testSubmitSessionInvalidDuration() throws Exception {
        String payload = """
            {
                "sessionId": "sess-inv-dur",
                "durationSeconds": 45,
                "correctCharacters": 50,
                "incorrectCharacters": 0,
                "totalCharactersTyped": 50,
                "elapsedSeconds": 45.0
            }
            """;

        mockMvc.perform(post("/api/type-storm/records/" + TEST_BROWSER_ID)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Duration must be one of: 15, 30, 60 seconds")));
    }

    @Test
    @DisplayName("Preflight OPTIONS request from LAN IP to TypeStorm endpoint returns CORS headers")
    void testPreflightLanIpTypeStorm() throws Exception {
        mockMvc.perform(options("/api/type-storm/records/" + TEST_BROWSER_ID)
                        .header(HttpHeaders.ORIGIN, "http://192.168.1.6:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://192.168.1.6:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString("POST")));
    }
}
