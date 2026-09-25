package com.smartwardrobe.config;

import com.smartwardrobe.auth.UserRepository;
import com.smartwardrobe.clothing.ClothingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SmartWardrobeHealthIndicator implements HealthIndicator {

    private final ClothingRepository clothingRepository;
    private final UserRepository userRepository;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Override
    public Health health() {
        try {
            long totalClothes = clothingRepository.count();
            long totalUsers = userRepository.count();
            boolean hasGeminiKey = geminiApiKey != null && !geminiApiKey.trim().isEmpty();

            return Health.up()
                    .withDetail("system", "Smart Wardrobe AI Studio")
                    .withDetail("database", "Online")
                    .withDetail("totalClothes", totalClothes)
                    .withDetail("totalUsers", totalUsers)
                    .withDetail("aiRecommendationMode", hasGeminiKey ? "Gemini 1.5 Flash (Cloud)" : "Deterministic Heuristic Fallback Engine")
                    .withDetail("statusMessage", "System operational and serving requests.")
                    .build();
        } catch (Exception e) {
            return Health.down(e)
                    .withDetail("database", "Offline or unreachable")
                    .build();
        }
    }
}
