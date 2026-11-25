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
class SessionHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private static final String BROWSER_A = "11111111-aaaa-4111-8aaa-111111111111";
    private static final String BROWSER_B = "22222222-bbbb-4222-8bbb-222222222222";
    private static final String BROWSER_NEW = "99999999-ffff-4999-8fff-999999999999";

    // ── 1. Valid history retrieval for all four games ──

    @Test
    @DisplayName("1.1 TypeStorm session history returns 200 with valid session fields")
    void testTypeStormSessionHistory() throws Exception {
        String payload = """
            {
                "sessionId": "ts-sess-1",
                "durationSeconds": 30,
                "correctCharacters": 150,
                "incorrectCharacters": 10,
                "totalCharactersTyped": 160,
                "elapsedSeconds": 30.0
            }
            """;
        mockMvc.perform(post("/api/type-storm/records/" + BROWSER_A)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage", is(0)))
                .andExpect(jsonPath("$.pageSize", is(10)))
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.totalPages", is(1)))
                .andExpect(jsonPath("$.hasNext", is(false)))
                .andExpect(jsonPath("$.hasPrevious", is(false)))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("ts-sess-1")))
                .andExpect(jsonPath("$.content[0].durationSeconds", is(30)))
                .andExpect(jsonPath("$.content[0].wpm", is(60)))
                .andExpect(jsonPath("$.content[0].accuracy", is(93.8)))
                .andExpect(jsonPath("$.content[0].correctCharacters", is(150)))
                .andExpect(jsonPath("$.content[0].incorrectCharacters", is(10)))
                .andExpect(jsonPath("$.content[0].completedAt", notNullValue()));
    }

    @Test
    @DisplayName("1.2 Whack Attack session history returns 200 with valid session fields")
    void testWhackAttackSessionHistory() throws Exception {
        String payload = """
            {
                "sessionId": "wa-sess-1",
                "durationSeconds": 30,
                "score": 150,
                "hits": 10,
                "misses": 2,
                "emptyClicks": 1,
                "bestCombo": 4,
                "elapsedSeconds": 30.0
            }
            """;
        mockMvc.perform(post("/api/whack-attack/records/" + BROWSER_A)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/whack-attack/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("wa-sess-1")))
                .andExpect(jsonPath("$.content[0].durationSeconds", is(30)))
                .andExpect(jsonPath("$.content[0].score", is(150)))
                .andExpect(jsonPath("$.content[0].hits", is(10)))
                .andExpect(jsonPath("$.content[0].misses", is(2)))
                .andExpect(jsonPath("$.content[0].emptyClicks", is(1)))
                .andExpect(jsonPath("$.content[0].bestCombo", is(4)))
                .andExpect(jsonPath("$.content[0].highestCombo", is(4)))
                .andExpect(jsonPath("$.content[0].accuracy", is(76.9)))
                .andExpect(jsonPath("$.content[0].completedAt", notNullValue()));
    }

    @Test
    @DisplayName("1.3 Sequence Master session history returns 200 with valid session fields")
    void testSequenceMasterSessionHistory() throws Exception {
        String payload = """
            {
                "sessionId": "sm-sess-1",
                "difficulty": "EASY",
                "score": 100,
                "highestSequenceLength": 2,
                "completedRounds": 1,
                "totalCorrectTiles": 1,
                "elapsedSeconds": 10.0
            }
            """;
        mockMvc.perform(post("/api/sequence-master/records/" + BROWSER_A)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("sm-sess-1")))
                .andExpect(jsonPath("$.content[0].difficulty", is("EASY")))
                .andExpect(jsonPath("$.content[0].score", is(100)))
                .andExpect(jsonPath("$.content[0].highestSequenceLength", is(2)))
                .andExpect(jsonPath("$.content[0].completedRounds", is(1)))
                .andExpect(jsonPath("$.content[0].totalCorrectTiles", is(1)))
                .andExpect(jsonPath("$.content[0].completedAt", notNullValue()));
    }

    @Test
    @DisplayName("1.4 Memory Madness session history returns 200 with valid session fields")
    void testMemoryMadnessSessionHistory() throws Exception {
        String payload = """
            {
                "sessionId": "mm-sess-1",
                "difficulty": "EASY",
                "score": 2500,
                "completionTimeSeconds": 35.5,
                "totalMoves": 10,
                "matchedPairs": 8,
                "mismatchedAttempts": 2,
                "accuracy": 80.0
            }
            """;
        mockMvc.perform(post("/api/memory-madness/records/" + BROWSER_A)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/memory-madness/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("mm-sess-1")))
                .andExpect(jsonPath("$.content[0].difficulty", is("EASY")))
                .andExpect(jsonPath("$.content[0].score", is(2500)))
                .andExpect(jsonPath("$.content[0].totalMoves", is(10)))
                .andExpect(jsonPath("$.content[0].moves", is(10)))
                .andExpect(jsonPath("$.content[0].matchedPairs", is(8)))
                .andExpect(jsonPath("$.content[0].mismatchedAttempts", is(2)))
                .andExpect(jsonPath("$.content[0].mismatches", is(2)))
                .andExpect(jsonPath("$.content[0].completionTimeSeconds", is(35.5)))
                .andExpect(jsonPath("$.content[0].accuracy", is(80.0)))
                .andExpect(jsonPath("$.content[0].completedAt", notNullValue()));
    }

    // ── 2. Empty history for a new browser ID ──

    @Test
    @DisplayName("2. Empty history for new browser ID returns 200 OK with empty content")
    void testEmptyHistoryForNewBrowserId() throws Exception {
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_NEW + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(0)))
                .andExpect(jsonPath("$.totalPages", is(0)))
                .andExpect(jsonPath("$.content", hasSize(0)))
                .andExpect(jsonPath("$.hasNext", is(false)))
                .andExpect(jsonPath("$.hasPrevious", is(false)));

        mockMvc.perform(get("/api/whack-attack/records/" + BROWSER_NEW + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(0)))
                .andExpect(jsonPath("$.content", hasSize(0)));

        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_NEW + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(0)))
                .andExpect(jsonPath("$.content", hasSize(0)));

        mockMvc.perform(get("/api/memory-madness/records/" + BROWSER_NEW + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(0)))
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    // ── 3. Browser ID isolation ──

    @Test
    @DisplayName("3. Browser ID isolation ensures browser A cannot see browser B's sessions")
    void testBrowserIdIsolation() throws Exception {
        // Browser A submits
        mockMvc.perform(post("/api/type-storm/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "sess-user-a",
                        "durationSeconds": 15,
                        "correctCharacters": 50,
                        "incorrectCharacters": 0,
                        "totalCharactersTyped": 50,
                        "elapsedSeconds": 15.0
                    }
                    """)).andExpect(status().isOk());

        // Browser B submits
        mockMvc.perform(post("/api/type-storm/records/" + BROWSER_B)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "sess-user-b",
                        "durationSeconds": 30,
                        "correctCharacters": 100,
                        "incorrectCharacters": 5,
                        "totalCharactersTyped": 105,
                        "elapsedSeconds": 30.0
                    }
                    """)).andExpect(status().isOk());

        // Browser A query
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("sess-user-a")));

        // Browser B query
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_B + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("sess-user-b")));
    }

    // ── 4. Default pagination ──

    @Test
    @DisplayName("4. Default pagination uses page 0 and size 10")
    void testDefaultPagination() throws Exception {
        // Submit 12 sessions
        for (int i = 1; i <= 12; i++) {
            mockMvc.perform(post("/api/type-storm/records/" + BROWSER_A)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(String.format("""
                        {
                            "sessionId": "page-sess-%d",
                            "durationSeconds": 15,
                            "correctCharacters": 50,
                            "incorrectCharacters": 0,
                            "totalCharactersTyped": 50,
                            "elapsedSeconds": 15.0
                        }
                        """, i))).andExpect(status().isOk());
        }

        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage", is(0)))
                .andExpect(jsonPath("$.pageSize", is(10)))
                .andExpect(jsonPath("$.totalElements", is(12)))
                .andExpect(jsonPath("$.totalPages", is(2)))
                .andExpect(jsonPath("$.hasNext", is(true)))
                .andExpect(jsonPath("$.hasPrevious", is(false)))
                .andExpect(jsonPath("$.content", hasSize(10)));
    }

    // ── 5. Custom page and size ──

    @Test
    @DisplayName("5. Custom page and size retrieve correct page slice")
    void testCustomPageAndSize() throws Exception {
        for (int i = 1; i <= 7; i++) {
            mockMvc.perform(post("/api/type-storm/records/" + BROWSER_A)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(String.format("""
                        {
                            "sessionId": "custom-page-%d",
                            "durationSeconds": 15,
                            "correctCharacters": 50,
                            "incorrectCharacters": 0,
                            "totalCharactersTyped": 50,
                            "elapsedSeconds": 15.0
                        }
                        """, i))).andExpect(status().isOk());
        }

        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions?page=1&size=5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage", is(1)))
                .andExpect(jsonPath("$.pageSize", is(5)))
                .andExpect(jsonPath("$.totalElements", is(7)))
                .andExpect(jsonPath("$.totalPages", is(2)))
                .andExpect(jsonPath("$.hasNext", is(false)))
                .andExpect(jsonPath("$.hasPrevious", is(true)))
                .andExpect(jsonPath("$.content", hasSize(2)));
    }

    // ── 6. Maximum page-size enforcement ──

    @Test
    @DisplayName("6. Page size exceeding 50 returns 400 Bad Request")
    void testMaxPageSizeEnforcement() throws Exception {
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions?size=51"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("exceed 50")));

        mockMvc.perform(get("/api/whack-attack/records/" + BROWSER_A + "/sessions?size=100"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    // ── 7. Invalid pagination values ──

    @Test
    @DisplayName("7. Invalid pagination values (negative page or non-positive size) return 400")
    void testInvalidPaginationValues() throws Exception {
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions?page=-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));

        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A + "/sessions?size=0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));

        mockMvc.perform(get("/api/memory-madness/records/" + BROWSER_A + "/sessions?size=-5"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)));
    }

    // ── 8. Newest-first ordering ──

    @Test
    @DisplayName("8. Sessions are returned in newest-first order")
    void testNewestFirstOrdering() throws Exception {
        // Submit first session
        mockMvc.perform(post("/api/whack-attack/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "first-session",
                        "durationSeconds": 30,
                        "score": 100,
                        "hits": 10,
                        "misses": 0,
                        "emptyClicks": 0,
                        "bestCombo": 2,
                        "elapsedSeconds": 30.0
                    }
                    """)).andExpect(status().isOk());

        // Submit second session
        mockMvc.perform(post("/api/whack-attack/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "second-session",
                        "durationSeconds": 30,
                        "score": 200,
                        "hits": 15,
                        "misses": 0,
                        "emptyClicks": 0,
                        "bestCombo": 5,
                        "elapsedSeconds": 30.0
                    }
                    """)).andExpect(status().isOk());

        mockMvc.perform(get("/api/whack-attack/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[0].sessionId", is("second-session")))
                .andExpect(jsonPath("$.content[1].sessionId", is("first-session")));
    }

    // ── 9. Sequence Master difficulty filtering ──

    @Test
    @DisplayName("9. Sequence Master filters by difficulty when parameter is supplied")
    void testSequenceMasterDifficultyFiltering() throws Exception {
        // Submit EASY session
        mockMvc.perform(post("/api/sequence-master/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "sm-easy-1",
                        "difficulty": "EASY",
                        "score": 100,
                        "highestSequenceLength": 2,
                        "completedRounds": 1,
                        "totalCorrectTiles": 1,
                        "elapsedSeconds": 10.0
                    }
                    """)).andExpect(status().isOk());

        // Submit HARD session
        mockMvc.perform(post("/api/sequence-master/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "sm-hard-1",
                        "difficulty": "HARD",
                        "score": 210,
                        "highestSequenceLength": 3,
                        "completedRounds": 2,
                        "totalCorrectTiles": 3,
                        "elapsedSeconds": 18.0
                    }
                    """)).andExpect(status().isOk());

        // Filter EASY
        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A + "/sessions?difficulty=EASY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("sm-easy-1")))
                .andExpect(jsonPath("$.content[0].difficulty", is("EASY")));

        // Filter HARD (case insensitive)
        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A + "/sessions?difficulty=hard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("sm-hard-1")))
                .andExpect(jsonPath("$.content[0].difficulty", is("HARD")));

        // Filter MEDIUM (empty)
        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A + "/sessions?difficulty=MEDIUM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(0)))
                .andExpect(jsonPath("$.content", hasSize(0)));

        // Unfiltered (both)
        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(2)))
                .andExpect(jsonPath("$.content", hasSize(2)));
    }

    // ── 10. Memory Madness difficulty filtering ──

    @Test
    @DisplayName("10. Memory Madness filters by difficulty when parameter is supplied")
    void testMemoryMadnessDifficultyFiltering() throws Exception {
        // Submit EASY session
        mockMvc.perform(post("/api/memory-madness/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "mm-easy-1",
                        "difficulty": "EASY",
                        "score": 2000,
                        "completionTimeSeconds": 30.0,
                        "totalMoves": 10,
                        "matchedPairs": 8,
                        "mismatchedAttempts": 2,
                        "accuracy": 80.0
                    }
                    """)).andExpect(status().isOk());

        // Submit MEDIUM session
        mockMvc.perform(post("/api/memory-madness/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "mm-med-1",
                        "difficulty": "MEDIUM",
                        "score": 3500,
                        "completionTimeSeconds": 75.0,
                        "totalMoves": 22,
                        "matchedPairs": 18,
                        "mismatchedAttempts": 4,
                        "accuracy": 81.8
                    }
                    """)).andExpect(status().isOk());

        // Filter EASY
        mockMvc.perform(get("/api/memory-madness/records/" + BROWSER_A + "/sessions?difficulty=EASY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("mm-easy-1")))
                .andExpect(jsonPath("$.content[0].difficulty", is("EASY")));

        // Filter MEDIUM
        mockMvc.perform(get("/api/memory-madness/records/" + BROWSER_A + "/sessions?difficulty=medium"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(1)))
                .andExpect(jsonPath("$.content[0].sessionId", is("mm-med-1")))
                .andExpect(jsonPath("$.content[0].difficulty", is("MEDIUM")));

        // Unfiltered
        mockMvc.perform(get("/api/memory-madness/records/" + BROWSER_A + "/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements", is(2)))
                .andExpect(jsonPath("$.content", hasSize(2)));
    }

    // ── 11. Invalid difficulty values ──

    @Test
    @DisplayName("11. Unsupported difficulty values return 400 Bad Request")
    void testInvalidDifficultyValues() throws Exception {
        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A + "/sessions?difficulty=NIGHTMARE"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Difficulty must be one of: EASY, MEDIUM, HARD")));

        mockMvc.perform(get("/api/memory-madness/records/" + BROWSER_A + "/sessions?difficulty=EXTREME"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.message", containsString("Difficulty must be one of: EASY, MEDIUM, HARD")));
    }

    // ── 12. Pagination metadata correctness ──

    @Test
    @DisplayName("12. Pagination metadata accurately reflects page boundaries, total pages and elements")
    void testPaginationMetadataCorrectness() throws Exception {
        for (int i = 1; i <= 25; i++) {
            mockMvc.perform(post("/api/type-storm/records/" + BROWSER_A)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(String.format("""
                        {
                            "sessionId": "meta-sess-%d",
                            "durationSeconds": 15,
                            "correctCharacters": 50,
                            "incorrectCharacters": 0,
                            "totalCharactersTyped": 50,
                            "elapsedSeconds": 15.0
                        }
                        """, i))).andExpect(status().isOk());
        }

        // Page 0 of size 10 (items 1-10)
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions?page=0&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage", is(0)))
                .andExpect(jsonPath("$.pageSize", is(10)))
                .andExpect(jsonPath("$.totalElements", is(25)))
                .andExpect(jsonPath("$.totalPages", is(3)))
                .andExpect(jsonPath("$.hasNext", is(true)))
                .andExpect(jsonPath("$.hasPrevious", is(false)))
                .andExpect(jsonPath("$.content", hasSize(10)));

        // Page 1 of size 10 (items 11-20)
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions?page=1&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage", is(1)))
                .andExpect(jsonPath("$.hasNext", is(true)))
                .andExpect(jsonPath("$.hasPrevious", is(true)))
                .andExpect(jsonPath("$.content", hasSize(10)));

        // Page 2 of size 10 (items 21-25)
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions?page=2&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage", is(2)))
                .andExpect(jsonPath("$.hasNext", is(false)))
                .andExpect(jsonPath("$.hasPrevious", is(true)))
                .andExpect(jsonPath("$.content", hasSize(5)));

        // Page 3 of size 10 (empty beyond end)
        mockMvc.perform(get("/api/type-storm/records/" + BROWSER_A + "/sessions?page=3&size=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentPage", is(3)))
                .andExpect(jsonPath("$.totalElements", is(25)))
                .andExpect(jsonPath("$.hasNext", is(false)))
                .andExpect(jsonPath("$.hasPrevious", is(true)))
                .andExpect(jsonPath("$.content", hasSize(0)));
    }

    // ── 13. Existing records endpoints remaining unaffected ──

    @Test
    @DisplayName("13. Existing records overview and record endpoints remain unaffected")
    void testExistingRecordsEndpointsUnaffected() throws Exception {
        // Whack Attack submit and record get
        mockMvc.perform(post("/api/whack-attack/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "existing-wa-sess",
                        "durationSeconds": 30,
                        "score": 120,
                        "hits": 10,
                        "misses": 1,
                        "emptyClicks": 0,
                        "bestCombo": 3,
                        "elapsedSeconds": 30.0
                    }
                    """)).andExpect(status().isOk());

        mockMvc.perform(get("/api/whack-attack/records/" + BROWSER_A))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.highestScore", is(120)))
                .andExpect(jsonPath("$.totalGamesPlayed", is(1)));

        // Sequence Master overview and difficulty record get
        mockMvc.perform(post("/api/sequence-master/records/" + BROWSER_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                        "sessionId": "existing-sm-sess",
                        "difficulty": "EASY",
                        "score": 100,
                        "highestSequenceLength": 2,
                        "completedRounds": 1,
                        "totalCorrectTiles": 1,
                        "elapsedSeconds": 10.0
                    }
                    """)).andExpect(status().isOk());

        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.easy.highestScore", is(100)))
                .andExpect(jsonPath("$.medium", nullValue()));

        mockMvc.perform(get("/api/sequence-master/records/" + BROWSER_A + "/EASY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.highestScore", is(100)));
    }
}
