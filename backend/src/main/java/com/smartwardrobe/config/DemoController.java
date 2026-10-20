package com.smartwardrobe.config;

import com.smartwardrobe.clothing.ClothingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartwardrobe.auth.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoController {

    private final DataInitializer dataInitializer;
    private final ClothingRepository clothingRepository;
    private final com.smartwardrobe.outfit.OutfitRepository outfitRepository;

    @PostMapping("/reset-and-seed")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> resetAndSeed(@AuthenticationPrincipal User currentUser) {
        User targetUser = (currentUser != null) ? currentUser : dataInitializer.ensureDemoUserExists();
        outfitRepository.deleteByUser(targetUser);
        clothingRepository.deleteByUser(targetUser);
        dataInitializer.seedWardrobeForUser(targetUser);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Demo capsule wardrobe has been successfully reloaded with curated pieces!",
                "totalItems", clothingRepository.countByUser(targetUser)
        ));
    }
}
