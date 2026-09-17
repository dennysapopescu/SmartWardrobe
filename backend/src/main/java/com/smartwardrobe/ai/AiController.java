package com.smartwardrobe.ai;

import com.smartwardrobe.ai.dto.AiTaggingResponse;
import com.smartwardrobe.common.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Tag(name = "AI Vision & Intelligence", description = "Multimodal clothing analysis and AI model status")
public class AiController {

    private final GeminiAiService geminiAiService;
    private final FileStorageService fileStorageService;

    @Value("${app.ai.gemini.api-key:}")
    private String serverApiKey;

    @Operation(summary = "Analyze clothing image with AI", description = "Extract cuts, category, color, style, season, and warmth using Google Gemini Vision or fallback simulator")
    @PostMapping(value = "/analyze-clothing", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AiTaggingResponse> analyzeClothing(
            @RequestPart("image") MultipartFile image,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String clientApiKey
    ) {
        AiTaggingResponse response = geminiAiService.analyzeClothingImage(image, null, clientApiKey);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/analyze-stored-image")
    public ResponseEntity<AiTaggingResponse> analyzeStoredImage(
            @RequestBody Map<String, String> payload,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String clientApiKey
    ) {
        String imageUrl = payload.get("imageUrl");
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        byte[] imageBytes = fileStorageService.loadFileAsBytes(imageUrl);
        AiTaggingResponse response = geminiAiService.analyzeClothingImage(null, imageBytes, clientApiKey);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAiStatus() {
        boolean hasServerKey = serverApiKey != null && !serverApiKey.trim().isEmpty();
        return ResponseEntity.ok(Map.of(
                "geminiConfigured", hasServerKey,
                "model", "gemini-1.5-flash",
                "mode", hasServerKey ? "LIVE_GEMINI" : "SIMULATED_MOCK",
                "freeTierAvailable", true,
                "message", hasServerKey
                        ? "Google Gemini Vision AI is active."
                        : "Smart AI Simulator active (100% Free). Optionally set your free Google Gemini API key in Settings."
        ));
    }
}
