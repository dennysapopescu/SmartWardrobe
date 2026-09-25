package com.smartwardrobe.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwardrobe.auth.dto.AuthResponse;
import com.smartwardrobe.auth.dto.LoginRequest;
import com.smartwardrobe.auth.dto.RegisterRequest;
import com.smartwardrobe.auth.dto.UserResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("h2")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /api/auth/demo returns 200 with JWT Bearer token and Demo Fashionista profile")
    void testDemoLogin_Returns200WithToken() throws Exception {
        mockMvc.perform(post("/api/auth/demo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.user.email").value("demo@smartwardrobe.com"))
                .andExpect(jsonPath("$.user.fullName").value("Demo Fashionista"));
    }

    @Test
    @DisplayName("POST /api/auth/register creates new user account and returns JWT token")
    void testRegisterUser_Success() throws Exception {
        String uniqueEmail = "user_" + System.currentTimeMillis() + "@test.com";
        RegisterRequest request = RegisterRequest.builder()
                .email(uniqueEmail)
                .password("securePassword123")
                .fullName("Alex Designer")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value(uniqueEmail))
                .andExpect(jsonPath("$.user.fullName").value("Alex Designer"))
                .andReturn();

        AuthResponse auth = objectMapper.readValue(result.getResponse().getContentAsString(), AuthResponse.class);
        assertNotNull(auth.getToken());

        // Verify /api/auth/me using Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + auth.getToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(uniqueEmail));
    }

    @Test
    @DisplayName("POST /api/auth/login with valid credentials returns JWT token")
    void testLoginUser_Success() throws Exception {
        // demo@smartwardrobe.com is seeded with password 'password123'
        LoginRequest request = LoginRequest.builder()
                .email("demo@smartwardrobe.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.user.email").value("demo@smartwardrobe.com"));
    }
}
