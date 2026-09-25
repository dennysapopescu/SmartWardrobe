package com.smartwardrobe.clothing;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartwardrobe.auth.User;
import com.smartwardrobe.clothing.dto.ClothingRequest;
import com.smartwardrobe.clothing.dto.ClothingResponse;
import com.smartwardrobe.common.FileStorageService;
import com.smartwardrobe.common.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @Operation(summary = "Get paginated clothing items", description = "Retrieve wardrobe items with pagination, sorting, and optional filtering")
    @GetMapping
    public ResponseEntity<PageResponse<ClothingResponse>> getClothes(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(required = false) ClothingCategory category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean favorite,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        String[] sortParts = sort.split(",");
        Sort.Direction direction = (sortParts.length > 1 && sortParts[1].equalsIgnoreCase("asc"))
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        String property = sortParts[0].trim();
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size), Sort.by(direction, property));

        return ResponseEntity.ok(clothingService.getClothesPaginated(currentUser, category, search, favorite, pageable));
    }

    @Operation(summary = "Get all clothing items", description = "Retrieve all items for current user without pagination (for outfit generator & studio)")
    @GetMapping("/all")
    public ResponseEntity<List<ClothingResponse>> getAllClothes(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(clothingService.getAllItems(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClothingResponse> getClothingById(@PathVariable Long id) {
        return ResponseEntity.ok(clothingService.getItemById(id));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ClothingResponse> createItemJson(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody ClothingRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clothingService.createItem(request, null, currentUser));
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
            @AuthenticationPrincipal User currentUser,
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
                .body(clothingService.createItem(request, image, currentUser));
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
