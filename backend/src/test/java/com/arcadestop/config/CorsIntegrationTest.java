package com.arcadestop.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CorsIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Preflight OPTIONS request from localhost:5173 returns allowed CORS headers")
    void testPreflightLocalhost() throws Exception {
        mockMvc.perform(options("/api/games")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.GET.name()))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString("GET")));
    }

    @Test
    @DisplayName("Preflight OPTIONS request from 127.0.0.1:5173 returns allowed CORS headers")
    void testPreflightLoopbackIp() throws Exception {
        mockMvc.perform(options("/api/games")
                        .header(HttpHeaders.ORIGIN, "http://127.0.0.1:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.GET.name()))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://127.0.0.1:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString("GET")));
    }

    @Test
    @DisplayName("Preflight OPTIONS request from LAN IP http://192.168.1.6:5173 returns allowed CORS headers")
    void testPreflightLanIp() throws Exception {
        mockMvc.perform(options("/api/games")
                        .header(HttpHeaders.ORIGIN, "http://192.168.1.6:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.GET.name()))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://192.168.1.6:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString("GET")));
    }

    @Test
    @DisplayName("Preflight OPTIONS request for POST with headers returns allowed headers")
    void testPreflightPostWithHeaders() throws Exception {
        mockMvc.perform(options("/api/reaction-rush/records/00000000-0000-4000-8000-000000000001")
                        .header(HttpHeaders.ORIGIN, "http://192.168.1.6:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.POST.name())
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://192.168.1.6:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, containsString("POST")));
    }

    @Test
    @DisplayName("Actual GET request from LAN IP http://192.168.1.6:5173 returns Access-Control-Allow-Origin")
    void testActualGetRequestLanIp() throws Exception {
        mockMvc.perform(get("/api/games")
                        .header(HttpHeaders.ORIGIN, "http://192.168.1.6:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://192.168.1.6:5173"));
    }

    @Test
    @DisplayName("Preflight OPTIONS request from unauthorized origin is rejected with 403 Forbidden")
    void testPreflightUnauthorizedOriginRejected() throws Exception {
        mockMvc.perform(options("/api/games")
                        .header(HttpHeaders.ORIGIN, "http://malicious-site.example.com")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, HttpMethod.GET.name()))
                .andExpect(status().isForbidden());
    }
}
