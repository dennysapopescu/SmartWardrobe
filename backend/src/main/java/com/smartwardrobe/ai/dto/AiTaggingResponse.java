package com.smartwardrobe.ai.dto;

import com.smartwardrobe.clothing.ClothingCategory;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiTaggingResponse {
    private String name;
    private ClothingCategory category;
    private String subCategory;
    private String primaryColor;
    private String secondaryColor;
    private String pattern;
    private String style; // CASUAL, ELEGANT, OFFICE, STREETWEAR, PARTY, SPORTY
    private String season; // SPRING, SUMMER, FALL, WINTER, ALL_SEASON
    private Integer warmthLevel; // 1 to 5
    private String analysisNotes;
    private boolean simulated;
}
