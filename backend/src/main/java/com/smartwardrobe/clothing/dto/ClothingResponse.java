package com.smartwardrobe.clothing.dto;

import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingResponse {

    private Long id;
    private String name;
    private ClothingCategory category;
    private String subCategory;
    private String primaryColor;
    private String secondaryColor;
    private String pattern;
    private String style;
    private String season;
    private Integer warmthLevel;
    private String imageUrl;
    private boolean favorite;
    private LocalDateTime createdAt;

    public static ClothingResponse fromEntity(ClothingItem item) {
        return ClothingResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .category(item.getCategory())
                .subCategory(item.getSubCategory())
                .primaryColor(item.getPrimaryColor())
                .secondaryColor(item.getSecondaryColor())
                .pattern(item.getPattern())
                .style(item.getStyle())
                .season(item.getSeason())
                .warmthLevel(item.getWarmthLevel())
                .imageUrl(item.getImageUrl())
                .favorite(item.isFavorite())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
