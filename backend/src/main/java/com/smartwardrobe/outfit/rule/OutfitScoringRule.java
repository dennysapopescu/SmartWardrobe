package com.smartwardrobe.outfit.rule;

import com.smartwardrobe.clothing.ClothingItem;

/**
 * Strategy interface for modular outfit candidate scoring.
 * Allows independent, testable rules to evaluate suitability based on style,
 * weather, footwear compatibility, and color harmony.
 */
public interface OutfitScoringRule {
    int score(ClothingItem item, OutfitContext context);
}
