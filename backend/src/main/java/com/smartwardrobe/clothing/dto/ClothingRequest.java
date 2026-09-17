package com.smartwardrobe.clothing.dto;

import com.smartwardrobe.clothing.ClothingCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClothingRequest {

    @NotBlank(message = "Numele piesei este obligatoriu")
    private String name;

    @NotNull(message = "Categoria este obligatorie")
    private ClothingCategory category;

    private String subCategory;

    @NotBlank(message = "Culoarea dominantă este obligatorie")
    private String primaryColor;

    private String secondaryColor;
    private String pattern;
    private String style;
    private String season;
    private Integer warmthLevel;
    private String imageUrl;
    private Boolean favorite;
}
