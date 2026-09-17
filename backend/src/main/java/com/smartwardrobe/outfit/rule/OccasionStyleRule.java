package com.smartwardrobe.outfit.rule;

import com.smartwardrobe.clothing.ClothingItem;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(10)
public class OccasionStyleRule implements OutfitScoringRule {

    @Override
    public int score(ClothingItem item, OutfitContext context) {
        String targetStyle = context.getTargetStyle();
        String itemStyle = (item.getStyle() != null) ? item.getStyle().toUpperCase() : "CASUAL";
        int score = 0;

        switch (targetStyle != null ? targetStyle.toUpperCase() : "CASUAL") {
            case "SPORTY":
                if ("SPORTY".equals(itemStyle)) score += 120;
                else if ("CASUAL".equals(itemStyle)) score += 60;
                else if ("STREETWEAR".equals(itemStyle)) score += 50;
                else if ("OFFICE".equals(itemStyle)) score -= 40;
                else if ("ELEGANT".equals(itemStyle) || "PARTY".equals(itemStyle)) score -= 150;
                break;

            case "ELEGANT":
                if ("ELEGANT".equals(itemStyle)) score += 120;
                else if ("PARTY".equals(itemStyle)) score += 80;
                else if ("OFFICE".equals(itemStyle)) score += 60;
                else if ("CASUAL".equals(itemStyle)) score += 20;
                else if ("SPORTY".equals(itemStyle)) score -= 150;
                break;

            case "PARTY":
                if ("PARTY".equals(itemStyle)) score += 120;
                else if ("ELEGANT".equals(itemStyle)) score += 85;
                else if ("STREETWEAR".equals(itemStyle)) score += 50;
                else if ("CASUAL".equals(itemStyle)) score += 25;
                else if ("OFFICE".equals(itemStyle)) score -= 50;
                else if ("SPORTY".equals(itemStyle)) score -= 120;
                break;

            case "OFFICE":
                if ("OFFICE".equals(itemStyle)) score += 120;
                else if ("ELEGANT".equals(itemStyle)) score += 70;
                else if ("CASUAL".equals(itemStyle)) score += 40;
                else if ("STREETWEAR".equals(itemStyle)) score += 10;
                else if ("SPORTY".equals(itemStyle) || "PARTY".equals(itemStyle)) score -= 120;
                break;

            case "STREETWEAR":
                if ("STREETWEAR".equals(itemStyle)) score += 120;
                else if ("CASUAL".equals(itemStyle)) score += 80;
                else if ("SPORTY".equals(itemStyle)) score += 60;
                else if ("OFFICE".equals(itemStyle)) score += 20;
                else if ("ELEGANT".equals(itemStyle)) score -= 70;
                break;

            default: // CASUAL
                if ("CASUAL".equals(itemStyle)) score += 120;
                else if ("STREETWEAR".equals(itemStyle)) score += 80;
                else if ("SPORTY".equals(itemStyle)) score += 60;
                else if ("OFFICE".equals(itemStyle)) score += 40;
                else if ("ELEGANT".equals(itemStyle)) score += 10;
                break;
        }

        return score;
    }
}
