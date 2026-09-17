package com.smartwardrobe.clothing;

import com.smartwardrobe.clothing.dto.ClothingRequest;
import com.smartwardrobe.clothing.dto.ClothingResponse;
import com.smartwardrobe.common.FileStorageService;
import com.smartwardrobe.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClothingService {

    private final ClothingRepository clothingRepository;
    private final FileStorageService fileStorageService;

    public List<ClothingResponse> getAllItems() {
        return clothingRepository.findAll().stream()
                .map(ClothingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public ClothingResponse getItemById(Long id) {
        ClothingItem item = clothingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clothing item with ID " + id + " was not found."));
        return ClothingResponse.fromEntity(item);
    }

    public List<ClothingResponse> getItemsByCategory(ClothingCategory category) {
        return clothingRepository.findByCategory(category).stream()
                .map(ClothingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ClothingResponse> getFavoriteItems() {
        return clothingRepository.findByFavoriteTrue().stream()
                .map(ClothingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ClothingResponse> searchItems(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllItems();
        }
        return clothingRepository.searchItems(query.trim()).stream()
                .map(ClothingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClothingResponse createItem(ClothingRequest request, MultipartFile imageFile) {
        String imageUrl = request.getImageUrl();
        if (imageFile != null && !imageFile.isEmpty()) {
            imageUrl = fileStorageService.storeFile(imageFile);
        } else if (imageUrl != null && imageUrl.startsWith("data:image")) {
            imageUrl = fileStorageService.storeBase64(imageUrl);
        }

        ClothingItem item = ClothingItem.builder()
                .name(request.getName())
                .category(request.getCategory())
                .subCategory(request.getSubCategory())
                .primaryColor(request.getPrimaryColor())
                .secondaryColor(request.getSecondaryColor())
                .pattern(request.getPattern() != null ? request.getPattern() : "Solid")
                .style(request.getStyle() != null ? request.getStyle().toUpperCase() : "CASUAL")
                .season(request.getSeason() != null ? request.getSeason().toUpperCase() : "ALL_SEASON")
                .warmthLevel(request.getWarmthLevel() != null ? request.getWarmthLevel() : 2)
                .imageUrl(imageUrl)
                .favorite(request.getFavorite() != null && request.getFavorite())
                .build();

        ClothingItem saved = clothingRepository.save(item);
        return ClothingResponse.fromEntity(saved);
    }

    @Transactional
    public ClothingResponse updateItem(Long id, ClothingRequest request) {
        ClothingItem item = clothingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clothing item with ID " + id + " was not found."));

        item.setName(request.getName());
        item.setCategory(request.getCategory());
        item.setSubCategory(request.getSubCategory());
        item.setPrimaryColor(request.getPrimaryColor());
        item.setSecondaryColor(request.getSecondaryColor());
        if (request.getPattern() != null) item.setPattern(request.getPattern());
        if (request.getStyle() != null) item.setStyle(request.getStyle().toUpperCase());
        if (request.getSeason() != null) item.setSeason(request.getSeason().toUpperCase());
        if (request.getWarmthLevel() != null) item.setWarmthLevel(request.getWarmthLevel());
        if (request.getImageUrl() != null) item.setImageUrl(request.getImageUrl());
        if (request.getFavorite() != null) item.setFavorite(request.getFavorite());

        return ClothingResponse.fromEntity(clothingRepository.save(item));
    }

    @Transactional
    public ClothingResponse toggleFavorite(Long id) {
        ClothingItem item = clothingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clothing item with ID " + id + " was not found."));
        item.setFavorite(!item.isFavorite());
        return ClothingResponse.fromEntity(clothingRepository.save(item));
    }

    @Transactional
    public void deleteItem(Long id) {
        if (!clothingRepository.existsById(id)) {
            throw new ResourceNotFoundException("Clothing item with ID " + id + " was not found.");
        }
        clothingRepository.deleteById(id);
    }

    public long countItems() {
        return clothingRepository.count();
    }
}
