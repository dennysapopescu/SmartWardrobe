package com.smartwardrobe.outfit.dto;

import com.smartwardrobe.clothing.dto.ClothingResponse;
import com.smartwardrobe.outfit.Outfit;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutfitResponse {
    private Long id;
    private String name;
    private String occasion;
    private String weatherCondition;
    private String stylingAdvice;
    private String colorPalette;
    private List<String> stylingTips;
    private boolean favorite;
    private List<ClothingResponse> items;
    private LocalDateTime createdAt;

    public static OutfitResponse fromEntity(Outfit outfit) {
        return OutfitResponse.builder()
                .id(outfit.getId())
                .name(outfit.getName())
                .occasion(outfit.getOccasion())
                .weatherCondition(outfit.getWeatherCondition())
                .stylingAdvice(outfit.getStylingAdvice())
                .colorPalette(outfit.getColorPalette())
                .stylingTips(Collections.emptyList())
                .favorite(outfit.isFavorite())
                .items(outfit.getItems() != null ? outfit.getItems().stream()
                        .map(ClothingResponse::fromEntity)
                        .collect(Collectors.toList()) : Collections.emptyList())
                .createdAt(outfit.getCreatedAt())
                .build();
    }
}
