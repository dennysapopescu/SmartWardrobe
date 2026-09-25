package com.smartwardrobe.outfit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomOutfitReviewRequest {
    private List<Long> itemIds;
    private String title;
    private String occasion;
    private String city;
    private Double overrideTemperature;
}
