package com.smartwardrobe.outfit.rule;

import com.smartwardrobe.clothing.ClothingItem;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@Order(50)
public class ColorHarmonyRule implements OutfitScoringRule {

    private static final Set<String> UNIVERSAL_NEUTRALS = Set.of(
            "white", "black", "grey", "gray", "charcoal", "beige", "ecru", "cream", "taupe", "camel", "navy", "denim"
    );

    // Complementary and tonal pairs that elevate outfits
    private static final Map<String, Set<String>> HARMONY_PAIRS = Map.of(
            "black", Set.of("white", "grey", "red", "beige", "ecru", "nude", "emerald"),
            "white", Set.of("black", "navy", "beige", "blue", "grey", "sage", "brown"),
            "navy", Set.of("white", "grey", "beige", "cream", "camel", "cognac", "ecru"),
            "beige", Set.of("brown", "white", "navy", "cream", "black", "sage"),
            "brown", Set.of("beige", "cream", "white", "ecru", "gold"),
            "sage", Set.of("white", "cream", "charcoal", "grey", "beige"),
            "emerald", Set.of("black", "champagne", "gold", "cream", "nude")
    );

    @Override
    public int score(ClothingItem item, OutfitContext context) {
        List<ClothingItem> existingItems = context.getAlreadySelectedItems();
        if (existingItems == null || existingItems.isEmpty()) {
            return 0; // First item chosen sets the tone
        }

        String itemColor = normalizeColor(item.getPrimaryColor());
        if (itemColor.isEmpty()) {
            return 0;
        }

        int harmonyScore = 0;
        for (ClothingItem selected : existingItems) {
            String selectedColor = normalizeColor(selected.getPrimaryColor());
            if (selectedColor.isEmpty()) continue;

            // 1. Check known harmony pairs
            if (HARMONY_PAIRS.getOrDefault(itemColor, Collections.emptySet()).contains(selectedColor)
                    || HARMONY_PAIRS.getOrDefault(selectedColor, Collections.emptySet()).contains(itemColor)) {
                harmonyScore += 35;
            }
            // 2. Dual neutrals (e.g. Black + Grey, Ecru + White, Navy + Beige)
            else if (UNIVERSAL_NEUTRALS.contains(itemColor) && UNIVERSAL_NEUTRALS.contains(selectedColor)) {
                harmonyScore += 25;
            }
            // 3. Monochromatic / tonal harmony (same dominant color)
            else if (itemColor.equals(selectedColor)) {
                harmonyScore += 20;
            }
            // 4. One neutral + one color accent
            else if (UNIVERSAL_NEUTRALS.contains(itemColor) || UNIVERSAL_NEUTRALS.contains(selectedColor)) {
                harmonyScore += 15;
            }
            // 5. Two non-neutral, unmapped distinct colors (potential clash)
            else {
                harmonyScore -= 25;
            }
        }

        // Return average harmony delta relative to outfit size
        return harmonyScore / existingItems.size();
    }

    private String normalizeColor(String color) {
        if (color == null) return "";
        String lower = color.toLowerCase().trim();
        for (String neutral : UNIVERSAL_NEUTRALS) {
            if (lower.contains(neutral)) return neutral;
        }
        for (String key : HARMONY_PAIRS.keySet()) {
            if (lower.contains(key)) return key;
        }
        if (lower.contains("blue")) return "navy";
        if (lower.contains("green")) return "sage";
        return lower;
    }
}
