package com.smartwardrobe.outfit;

import com.smartwardrobe.auth.User;
import com.smartwardrobe.outfit.dto.CustomOutfitReviewRequest;
import com.smartwardrobe.outfit.dto.OutfitGenerateRequest;
import com.smartwardrobe.outfit.dto.OutfitResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/outfits")
@RequiredArgsConstructor
@Tag(name = "Outfits", description = "AI outfit generation, styling advice, and lookbook management")
public class OutfitController {

    private final OutfitRecommendationService outfitService;

    @Operation(summary = "Generate outfit", description = "Compose an outfit using weather conditions, occasion styling rules, and Gemini AI advice")
    @PostMapping("/generate")
    public ResponseEntity<OutfitResponse> generateOutfit(
            @AuthenticationPrincipal User currentUser,
            @RequestBody OutfitGenerateRequest request,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String clientApiKey
    ) {
        return ResponseEntity.ok(outfitService.generateOutfit(request, clientApiKey, currentUser));
    }

    @Operation(summary = "Review custom outfit", description = "Evaluate a custom user-curated set of garments and provide AI stylist feedback")
    @PostMapping("/review-custom")
    public ResponseEntity<OutfitResponse> reviewCustomOutfit(
            @AuthenticationPrincipal User currentUser,
            @RequestBody CustomOutfitReviewRequest request,
            @RequestHeader(value = "X-Gemini-Api-Key", required = false) String clientApiKey
    ) {
        return ResponseEntity.ok(outfitService.reviewCustomOutfit(request, clientApiKey));
    }

    @Operation(summary = "Save outfit to Lookbook", description = "Store a curated outfit draft into the permanent lookbook collection")
    @PostMapping("/save")
    public ResponseEntity<OutfitResponse> saveOutfit(
            @AuthenticationPrincipal User currentUser,
            @RequestBody OutfitResponse draft
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(outfitService.saveOutfit(draft, currentUser));
    }

    @GetMapping
    public ResponseEntity<List<OutfitResponse>> getAllOutfits(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(outfitService.getAllSavedOutfits(currentUser));
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<OutfitResponse>> getFavoriteOutfits(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(outfitService.getFavoriteOutfits(currentUser));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<OutfitResponse> toggleFavorite(@PathVariable Long id) {
        return ResponseEntity.ok(outfitService.toggleFavorite(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOutfit(@PathVariable Long id) {
        outfitService.deleteOutfit(id);
        return ResponseEntity.noContent().build();
    }
}
