package com.smartwardrobe.auth;

import com.smartwardrobe.auth.dto.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "User registration, login, JWT token issuance, and instant portfolio demo session")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register user", description = "Register a new user account with email and password")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Login user", description = "Authenticate with email and password to receive a JWT Bearer token")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Quick demo login", description = "Instantly authenticate as demo fashionista for frictionless portfolio reviewing")
    @PostMapping("/demo")
    public ResponseEntity<AuthResponse> demoLogin() {
        return ResponseEntity.ok(authService.quickDemoLogin());
    }

    @Operation(summary = "Get current user profile", description = "Retrieve the authenticated user's profile")
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.toUserResponse(user));
    }
}
