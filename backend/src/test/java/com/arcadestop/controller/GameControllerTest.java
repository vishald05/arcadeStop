package com.arcadestop.controller;

import com.arcadestop.entity.GameStatus;
import com.arcadestop.repository.GameRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GameControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GameRepository gameRepository;

    @Test
    @DisplayName("Initial data initializer should have seeded 6 games")
    void testInitialSeedData() {
        long count = gameRepository.count();
        assertThat(count).isEqualTo(6L);
    }

    @Test
    @DisplayName("GET /api/games should return all 6 games")
    void testGetAllGames() throws Exception {
        mockMvc.perform(get("/api/games")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)))
                .andExpect(jsonPath("$[0].slug", is("reaction-rush")))
                .andExpect(jsonPath("$[0].featured", is(true)))
                .andExpect(jsonPath("$[0].status", is(GameStatus.COMING_SOON.name())));
    }

    @Test
    @DisplayName("GET /api/games/{slug} should return game details for valid slug")
    void testGetGameBySlugSuccess() throws Exception {
        mockMvc.perform(get("/api/games/reaction-rush")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Reaction Rush")))
                .andExpect(jsonPath("$.slug", is("reaction-rush")))
                .andExpect(jsonPath("$.category", is("Reflex")))
                .andExpect(jsonPath("$.icon", is("zap")))
                .andExpect(jsonPath("$.featured", is(true)))
                .andExpect(jsonPath("$.status", is("COMING_SOON")));
    }

    @Test
    @DisplayName("GET /api/games/{slug} should return 404 for nonexistent slug")
    void testGetGameBySlugNotFound() throws Exception {
        mockMvc.perform(get("/api/games/nonexistent-game")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.error", is("Not Found")))
                .andExpect(jsonPath("$.message", containsString("nonexistent-game")));
    }

    @Test
    @DisplayName("GET /api/games/category/{category} should filter games by category")
    void testGetGamesByCategory() throws Exception {
        // Both Reaction Rush and Whack Attack are Reflex games
        mockMvc.perform(get("/api/games/category/reflex")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[*].slug", containsInAnyOrder("reaction-rush", "whack-attack")));
    }

    @Test
    @DisplayName("GET /api/health should return UP status")
    void testHealthEndpoint() throws Exception {
        mockMvc.perform(get("/api/health")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is("UP")))
                .andExpect(jsonPath("$.service", is("ArcadeStop Backend")));
    }
}
