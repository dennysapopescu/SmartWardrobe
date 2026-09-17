package com.smartwardrobe.outfit.rule;

import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(30)
public class SportyApparelRule implements OutfitScoringRule {

    @Override
    public int score(ClothingItem item, OutfitContext context) {
        if (!context.isSportyContext()) {
            return 0;
        }

        String name = (item.getName() != null) ? item.getName().toLowerCase() : "";
        String subCat = (item.getSubCategory() != null) ? item.getSubCategory().toLowerCase() : "";
        String text = name + " " + subCat;
        int score = 0;

        if (item.getCategory() == ClothingCategory.BOTTOMS) {
            if (text.contains("legging") || text.contains("biker") || text.contains("jogger")
                    || text.contains("sweatpant") || text.contains("active")) {
                score += 100;
            }
            if (text.contains("trouser") || text.contains("pleat") || text.contains("dress pants")
                    || text.contains("skirt") || text.contains("linen")) {
                score -= 120;
            }
        }

        if (item.getCategory() == ClothingCategory.TOPS) {
            if (text.contains("sports") || text.contains("tank") || text.contains("crop")
                    || text.contains("tee") || text.contains("hoodie")) {
                score += 60;
            }
            if (text.contains("blouse") || text.contains("satin") || text.contains("poplin")
                    || text.contains("button-down") || text.contains("cashmere")) {
                score -= 120;
            }
        }

        if (item.getCategory() == ClothingCategory.OUTERWEAR) {
            if (text.contains("hoodie") || text.contains("jacket") || text.contains("fleece")
                    || text.contains("windbreaker")) {
                score += 80;
            }
            if (text.contains("blazer") || text.contains("trench") || text.contains("coat")) {
                score -= 150;
            }
        }

        if (item.getCategory() == ClothingCategory.ACCESSORIES) {
            if (text.contains("duffle") || text.contains("gym") || text.contains("cap")
                    || text.contains("bottle") || text.contains("band")) {
                score += 50;
            }
            if (text.contains("clutch") || text.contains("crossbody") || text.contains("chain")
                    || text.contains("jewelry") || text.contains("sunglasses")) {
                score -= 100;
            }
        }

        return score;
    }
}
