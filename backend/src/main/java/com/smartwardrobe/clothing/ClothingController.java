package com.smartwardrobe.clothing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwardrobe.clothing.dto.ClothingRequest;
import com.smartwardrobe.clothing.dto.ClothingResponse;
import com.smartwardrobe.common.FileStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/clothes")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Clothing", description = "Digital closet catalog, search, upload & wardrobe management")
public class ClothingController {

    private final ClothingService clothingService;
    private final FileStorageService fileStorageService;
    private final ObjectMapper objectMapper;

    @Operation(summary = "Get clothing items", description = "Retrieve wardrobe items with optional filtering by category, search query, or favorites")
    @GetMapping
    public ResponseEntity<List<ClothingResponse>> getClothes(
            @RequestParam(required = false) ClothingCategory category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean favorite
    ) {
        if (Boolean.TRUE.equals(favorite)) {
            return ResponseEntity.ok(clothingService.getFavoriteItems());
        }
        if (category != null) {
            return ResponseEntity.ok(clothingService.getItemsByCategory(category));
        }
        if (search != null && !search.trim().isEmpty()) {
            return ResponseEntity.ok(clothingService.searchItems(search));
        }
        return ResponseEntity.ok(clothingService.getAllItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClothingResponse> getClothingById(@PathVariable Long id) {
        return ResponseEntity.ok(clothingService.getItemById(id));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClothingResponse> createItemJson(@Valid @RequestBody ClothingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clothingService.createItem(request, null));
    }

    @PostMapping("/upload-image")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("image") MultipartFile image
    ) {
        if (image == null || image.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Image file is required"));
        }
        String storedUrl = fileStorageService.storeFile(image);
        return ResponseEntity.ok(Map.of("imageUrl", storedUrl));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ClothingResponse> createItemMultipart(
            @RequestParam(value = "item", required = false) String itemJson,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "subCategory", required = false) String subCategory,
            @RequestParam(value = "primaryColor", required = false) String primaryColor,
            @RequestParam(value = "secondaryColor", required = false) String secondaryColor,
            @RequestParam(value = "pattern", required = false) String pattern,
            @RequestParam(value = "style", required = false) String style,
            @RequestParam(value = "season", required = false) String season,
            @RequestParam(value = "warmthLevel", required = false) Integer warmthLevel,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "favorite", required = false) Boolean favorite,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        ClothingRequest request = null;

        if (itemJson != null && !itemJson.trim().isEmpty()) {
            try {
                request = objectMapper.readValue(itemJson, ClothingRequest.class);
            } catch (Exception e) {
                log.warn("Could not deserialize 'item' json part: {}", e.getMessage());
            }
        }

        if (request == null) {
            ClothingCategory cat = (category != null) ? ClothingCategory.valueOf(category.toUpperCase()) : ClothingCategory.TOPS;
            request = ClothingRequest.builder()
                    .name(name != null ? name : "Untitled Clothing")
                    .category(cat)
                    .subCategory(subCategory)
                    .primaryColor(primaryColor != null ? primaryColor : "Neutral")
                    .secondaryColor(secondaryColor)
                    .pattern(pattern != null ? pattern : "Solid")
                    .style(style != null ? style : "CASUAL")
                    .season(season != null ? season : "ALL_SEASON")
                    .warmthLevel(warmthLevel != null ? warmthLevel : 2)
                    .imageUrl(imageUrl)
                    .favorite(Boolean.TRUE.equals(favorite))
                    .build();
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clothingService.createItem(request, image));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClothingResponse> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody ClothingRequest request
    ) {
        return ResponseEntity.ok(clothingService.updateItem(id, request));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<ClothingResponse> toggleFavorite(@PathVariable Long id) {
        return ResponseEntity.ok(clothingService.toggleFavorite(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        clothingService.deleteItem(id);
        return ResponseEntity.noContent().build();
    }
}
