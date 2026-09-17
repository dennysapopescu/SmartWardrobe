package com.smartwardrobe.outfit.rule;

import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(20)
public class SportyFootwearRule implements OutfitScoringRule {

    @Override
    public int score(ClothingItem item, OutfitContext context) {
        if (!context.isSportyContext() || item.getCategory() != ClothingCategory.SHOES) {
            return 0;
        }

        String name = (item.getName() != null) ? item.getName().toLowerCase() : "";
        String subCat = (item.getSubCategory() != null) ? item.getSubCategory().toLowerCase() : "";
        String text = name + " " + subCat;

        int score = 0;
        if (text.contains("sneaker") || text.contains("running") || text.contains("athletic")
                || text.contains("trainer") || text.contains("cloudfoam") || text.contains("sport")) {
            score += 100;
        }

        if (text.contains("stiletto") || text.contains("pump") || text.contains("heel")
                || text.contains("heeled") || text.contains("sandal")) {
            score -= 300; // Strictly eliminate formal heels for workout/sport occasions
        }

        return score;
    }
}
