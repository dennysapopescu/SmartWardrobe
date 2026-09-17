package com.smartwardrobe.outfit.rule;

import com.smartwardrobe.clothing.ClothingItem;
import com.smartwardrobe.weather.dto.WeatherDto;
import lombok.Builder;
import lombok.Getter;

import java.util.Collections;
import java.util.List;

@Getter
@Builder
public class OutfitContext {
    private final String occasion;
    private final String targetStyle;
    private final WeatherDto weather;
    @Builder.Default
    private final List<ClothingItem> alreadySelectedItems = Collections.emptyList();

    public boolean isSportyContext() {
        if ("SPORTY".equalsIgnoreCase(targetStyle)) {
            return true;
        }
        if (occasion == null) return false;
        String lower = occasion.toLowerCase();
        return lower.contains("yoga") || lower.contains("gym") || lower.contains("workout")
                || lower.contains("sport") || lower.contains("pilates") || lower.contains("run");
    }
}
