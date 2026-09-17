package com.smartwardrobe.config;

import com.smartwardrobe.clothing.ClothingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/demo")
@RequiredArgsConstructor
public class DemoController {

    private final DataInitializer dataInitializer;
    private final ClothingRepository clothingRepository;

    @PostMapping("/reset-and-seed")
    public ResponseEntity<Map<String, Object>> resetAndSeed() {
        clothingRepository.deleteAll();
        dataInitializer.seedDemoWardrobe();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Demo capsule wardrobe has been successfully reloaded into PostgreSQL with 22 curated pieces!",
                "totalItems", clothingRepository.count()
        ));
    }
}
