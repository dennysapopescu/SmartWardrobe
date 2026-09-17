package com.smartwardrobe.config;

import com.smartwardrobe.clothing.ClothingCategory;
import com.smartwardrobe.clothing.ClothingItem;
import com.smartwardrobe.clothing.ClothingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ClothingRepository clothingRepository;

    @Override
    public void run(String... args) {
        if (clothingRepository.count() == 0) {
            log.info("Wardrobe is empty. Seeding capsule demo collection with 22 curated pieces into PostgreSQL...");
            seedDemoWardrobe();
            log.info("Capsule wardrobe seeded successfully.");
        }
    }

    public void seedDemoWardrobe() {
        List<ClothingItem> demoItems = Arrays.asList(
                // TOPS
                ClothingItem.builder()
                        .name("Classic White Poplin Shirt")
                        .category(ClothingCategory.TOPS)
                        .subCategory("Button-Down Shirt")
                        .primaryColor("White")
                        .secondaryColor("Neutral")
                        .pattern("Solid")
                        .style("OFFICE")
                        .season("ALL_SEASON")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now().minusDays(10))
                        .build(),

                ClothingItem.builder()
                        .name("Organic Cotton Minimalist Tee")
                        .category(ClothingCategory.TOPS)
                        .subCategory("Crewneck T-Shirt")
                        .primaryColor("Beige")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("CASUAL")
                        .season("SUMMER")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(9))
                        .build(),

                ClothingItem.builder()
                        .name("Chunky Ribbed Cashmere Sweater")
                        .category(ClothingCategory.TOPS)
                        .subCategory("Knit Sweater")
                        .primaryColor("Light Grey")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("CASUAL")
                        .season("FALL")
                        .warmthLevel(4)
                        .imageUrl("https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now().minusDays(8))
                        .build(),

                ClothingItem.builder()
                        .name("Silk Satin Evening Blouse")
                        .category(ClothingCategory.TOPS)
                        .subCategory("Satin Blouse")
                        .primaryColor("Black")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("ELEGANT")
                        .season("ALL_SEASON")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(7))
                        .build(),

                ClothingItem.builder()
                        .name("Breton Striped Long Sleeve")
                        .category(ClothingCategory.TOPS)
                        .subCategory("Marinière Top")
                        .primaryColor("Navy Blue")
                        .secondaryColor("White")
                        .pattern("Striped")
                        .style("CASUAL")
                        .season("SPRING")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(7))
                        .build(),

                // BOTTOMS
                ClothingItem.builder()
                        .name("High-Rise Straight Leg Denim")
                        .category(ClothingCategory.BOTTOMS)
                        .subCategory("Mom Jeans")
                        .primaryColor("Medium Blue")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("CASUAL")
                        .season("ALL_SEASON")
                        .warmthLevel(3)
                        .imageUrl("https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now().minusDays(6))
                        .build(),

                ClothingItem.builder()
                        .name("Tailored Pleated Trousers")
                        .category(ClothingCategory.BOTTOMS)
                        .subCategory("Dress Pants")
                        .primaryColor("Black")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("OFFICE")
                        .season("ALL_SEASON")
                        .warmthLevel(3)
                        .imageUrl("https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(5))
                        .build(),

                ClothingItem.builder()
                        .name("Champagne Pleated Midi Skirt")
                        .category(ClothingCategory.BOTTOMS)
                        .subCategory("Midi Skirt")
                        .primaryColor("Champagne Cream")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("ELEGANT")
                        .season("SPRING")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now().minusDays(5))
                        .build(),

                ClothingItem.builder()
                        .name("Wide-Leg Tailored Linen Pants")
                        .category(ClothingCategory.BOTTOMS)
                        .subCategory("Linen Pants")
                        .primaryColor("Ecru Beige")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("CASUAL")
                        .season("SUMMER")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(4))
                        .build(),

                // DRESSES
                ClothingItem.builder()
                        .name("Emerald Silk Slip Dress")
                        .category(ClothingCategory.DRESSES)
                        .subCategory("Slip Dress")
                        .primaryColor("Emerald Green")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("ELEGANT")
                        .season("ALL_SEASON")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now().minusDays(4))
                        .build(),

                ClothingItem.builder()
                        .name("Belted Linen Shirt Dress")
                        .category(ClothingCategory.DRESSES)
                        .subCategory("Day Dress")
                        .primaryColor("Olive Khaki")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("CASUAL")
                        .season("SUMMER")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(4))
                        .build(),

                ClothingItem.builder()
                        .name("Timeless Little Black Dress")
                        .category(ClothingCategory.DRESSES)
                        .subCategory("Cocktail Dress")
                        .primaryColor("Black")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("PARTY")
                        .season("ALL_SEASON")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now().minusDays(3))
                        .build(),

                // OUTERWEAR
                ClothingItem.builder()
                        .name("Structured Oversized Blazer")
                        .category(ClothingCategory.OUTERWEAR)
                        .subCategory("Blazer")
                        .primaryColor("Camel Tan")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("OFFICE")
                        .season("ALL_SEASON")
                        .warmthLevel(3)
                        .imageUrl("https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now().minusDays(3))
                        .build(),

                ClothingItem.builder()
                        .name("Double-Breasted Heritage Trench")
                        .category(ClothingCategory.OUTERWEAR)
                        .subCategory("Trench Coat")
                        .primaryColor("Sand Beige")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("CASUAL")
                        .season("SPRING")
                        .warmthLevel(3)
                        .imageUrl("https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(3))
                        .build(),

                ClothingItem.builder()
                        .name("Wool Blend Tailored Longline Coat")
                        .category(ClothingCategory.OUTERWEAR)
                        .subCategory("Wool Coat")
                        .primaryColor("Charcoal Black")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("ELEGANT")
                        .season("WINTER")
                        .warmthLevel(5)
                        .imageUrl("https://images.unsplash.com/photo-1539533018447-63fcce667823?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .build(),

                // SHOES
                ClothingItem.builder()
                        .name("Minimalist White Leather Sneakers")
                        .category(ClothingCategory.SHOES)
                        .subCategory("Sneakers")
                        .primaryColor("Crisp White")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("STREETWEAR")
                        .season("ALL_SEASON")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now().minusDays(2))
                        .build(),

                ClothingItem.builder()
                        .name("Pointed-Toe Nude Stiletto Pumps")
                        .category(ClothingCategory.SHOES)
                        .subCategory("Stilettos")
                        .primaryColor("Nude Blush")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("ELEGANT")
                        .season("ALL_SEASON")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build(),

                ClothingItem.builder()
                        .name("Smooth Leather Chelsea Ankle Boots")
                        .category(ClothingCategory.SHOES)
                        .subCategory("Chelsea Boots")
                        .primaryColor("Black")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("CASUAL")
                        .season("FALL")
                        .warmthLevel(4)
                        .imageUrl("https://images.unsplash.com/photo-1543499459-726598042940?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build(),

                ClothingItem.builder()
                        .name("Strappy Heeled Metallic Sandals")
                        .category(ClothingCategory.SHOES)
                        .subCategory("Heeled Sandals")
                        .primaryColor("Gold")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("PARTY")
                        .season("SUMMER")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now().minusDays(1))
                        .build(),

                // ACCESSORIES
                ClothingItem.builder()
                        .name("Structured Leather Crossbody Bag")
                        .category(ClothingCategory.ACCESSORIES)
                        .subCategory("Crossbody Bag")
                        .primaryColor("Cognac Brown")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("ELEGANT")
                        .season("ALL_SEASON")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                ClothingItem.builder()
                        .name("Chic Cat-Eye Sunglasses")
                        .category(ClothingCategory.ACCESSORIES)
                        .subCategory("Sunglasses")
                        .primaryColor("Black")
                        .secondaryColor("Gold")
                        .pattern("Solid")
                        .style("CASUAL")
                        .season("ALL_SEASON")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now())
                        .build(),

                // ATHLEISURE & SPORT
                ClothingItem.builder()
                        .name("High-Waist Seamless Yoga Leggings")
                        .category(ClothingCategory.BOTTOMS)
                        .subCategory("Yoga Leggings")
                        .primaryColor("Charcoal Grey")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("SPORTY")
                        .season("ALL_SEASON")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                ClothingItem.builder()
                        .name("Breathable Ribbed Sports Tank Top")
                        .category(ClothingCategory.TOPS)
                        .subCategory("Sports Tank")
                        .primaryColor("Sage Green")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("SPORTY")
                        .season("SUMMER")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now())
                        .build(),

                ClothingItem.builder()
                        .name("Cloudfoam Athletic Running Sneakers")
                        .category(ClothingCategory.SHOES)
                        .subCategory("Running Sneakers")
                        .primaryColor("Pure White")
                        .secondaryColor("Silver")
                        .pattern("Solid")
                        .style("SPORTY")
                        .season("ALL_SEASON")
                        .warmthLevel(2)
                        .imageUrl("https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80")
                        .favorite(true)
                        .createdAt(LocalDateTime.now())
                        .build(),

                ClothingItem.builder()
                        .name("Oversized Cozy Fleece Workout Hoodie")
                        .category(ClothingCategory.OUTERWEAR)
                        .subCategory("Athletic Hoodie")
                        .primaryColor("Heather Grey")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("SPORTY")
                        .season("FALL")
                        .warmthLevel(3)
                        .imageUrl("https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now())
                        .build(),

                ClothingItem.builder()
                        .name("High-Rise Sculpt Biker Shorts")
                        .category(ClothingCategory.BOTTOMS)
                        .subCategory("Biker Shorts")
                        .primaryColor("Matte Black")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("SPORTY")
                        .season("SUMMER")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now())
                        .build(),

                ClothingItem.builder()
                        .name("Canvas Gym & Yoga Duffle")
                        .category(ClothingCategory.ACCESSORIES)
                        .subCategory("Gym Bag")
                        .primaryColor("Stone Taupe")
                        .secondaryColor(null)
                        .pattern("Solid")
                        .style("SPORTY")
                        .season("ALL_SEASON")
                        .warmthLevel(1)
                        .imageUrl("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80")
                        .favorite(false)
                        .createdAt(LocalDateTime.now())
                        .build()
        );

        clothingRepository.saveAll(demoItems);
    }
}
