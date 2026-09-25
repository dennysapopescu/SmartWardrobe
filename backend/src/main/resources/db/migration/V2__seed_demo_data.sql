-- ==============================================================================
-- V2__seed_demo_data.sql - Seed Demo User and Capsule Wardrobe Collection
-- ==============================================================================

-- 1. Insert Demo User (demo@smartwardrobe.com / password123)
-- BCrypt hash for 'password123': $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
INSERT INTO users (id, email, password, full_name, role, created_at)
SELECT 1, 'demo@smartwardrobe.com', '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG', 'Demo Fashionista', 'ROLE_USER', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'demo@smartwardrobe.com');

-- 2. Insert Curated Capsule Wardrobe for Demo User (user_id = 1)
INSERT INTO clothing_items (user_id, name, category, sub_category, primary_color, secondary_color, pattern, style, season, warmth_level, image_url, favorite, created_at)
VALUES
(1, 'Classic White Poplin Shirt', 'TOPS', 'Button-Down Shirt', 'White', 'Neutral', 'Solid', 'OFFICE', 'ALL_SEASON', 2, 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'Organic Cotton Minimalist Tee', 'TOPS', 'Crewneck T-Shirt', 'Beige', NULL, 'Solid', 'CASUAL', 'SUMMER', 1, 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Chunky Ribbed Cashmere Sweater', 'TOPS', 'Knit Sweater', 'Light Grey', NULL, 'Solid', 'CASUAL', 'FALL', 4, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'Silk Satin Evening Blouse', 'TOPS', 'Satin Blouse', 'Black', NULL, 'Solid', 'ELEGANT', 'ALL_SEASON', 2, 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Breton Striped Long Sleeve', 'TOPS', 'Marinière Top', 'Navy Blue', 'White', 'Striped', 'CASUAL', 'SPRING', 2, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),

(1, 'High-Rise Straight Leg Denim', 'BOTTOMS', 'Mom Jeans', 'Medium Blue', NULL, 'Solid', 'CASUAL', 'ALL_SEASON', 3, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'Tailored Pleated Trousers', 'BOTTOMS', 'Dress Pants', 'Black', NULL, 'Solid', 'OFFICE', 'ALL_SEASON', 3, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Champagne Pleated Midi Skirt', 'BOTTOMS', 'Midi Skirt', 'Champagne Cream', NULL, 'Solid', 'ELEGANT', 'SPRING', 2, 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'Wide-Leg Tailored Linen Pants', 'BOTTOMS', 'Linen Pants', 'Ecru Beige', NULL, 'Solid', 'CASUAL', 'SUMMER', 1, 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'High-Waist Seamless Yoga Leggings', 'BOTTOMS', 'Yoga Leggings', 'Charcoal Grey', NULL, 'Solid', 'SPORTY', 'ALL_SEASON', 2, 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'High-Rise Sculpt Biker Shorts', 'BOTTOMS', 'Biker Shorts', 'Matte Black', NULL, 'Solid', 'SPORTY', 'SUMMER', 1, 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),

(1, 'Emerald Silk Slip Dress', 'DRESSES', 'Slip Dress', 'Emerald Green', NULL, 'Solid', 'ELEGANT', 'ALL_SEASON', 2, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'Belted Linen Shirt Dress', 'DRESSES', 'Day Dress', 'Olive Khaki', NULL, 'Solid', 'CASUAL', 'SUMMER', 1, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Timeless Little Black Dress', 'DRESSES', 'Cocktail Dress', 'Black', NULL, 'Solid', 'PARTY', 'ALL_SEASON', 2, 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),

(1, 'Structured Oversized Blazer', 'OUTERWEAR', 'Blazer', 'Camel Tan', NULL, 'Solid', 'OFFICE', 'ALL_SEASON', 3, 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'Double-Breasted Heritage Trench', 'OUTERWEAR', 'Trench Coat', 'Sand Beige', NULL, 'Solid', 'CASUAL', 'SPRING', 3, 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Wool Blend Tailored Longline Coat', 'OUTERWEAR', 'Wool Coat', 'Charcoal Black', NULL, 'Solid', 'ELEGANT', 'WINTER', 5, 'https://images.unsplash.com/photo-1539533018447-63fcce667823?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Oversized Cozy Fleece Workout Hoodie', 'OUTERWEAR', 'Athletic Hoodie', 'Heather Grey', NULL, 'Solid', 'SPORTY', 'FALL', 3, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),

(1, 'Minimalist White Leather Sneakers', 'SHOES', 'Sneakers', 'Crisp White', NULL, 'Solid', 'STREETWEAR', 'ALL_SEASON', 2, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'Pointed-Toe Nude Stiletto Pumps', 'SHOES', 'Stilettos', 'Nude Blush', NULL, 'Solid', 'ELEGANT', 'ALL_SEASON', 2, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Smooth Leather Chelsea Ankle Boots', 'SHOES', 'Chelsea Boots', 'Black', NULL, 'Solid', 'CASUAL', 'FALL', 4, 'https://images.unsplash.com/photo-1543499459-726598042940?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Strappy Heeled Metallic Sandals', 'SHOES', 'Heeled Sandals', 'Gold', NULL, 'Solid', 'PARTY', 'SUMMER', 1, 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Cloudfoam Athletic Running Sneakers', 'SHOES', 'Running Sneakers', 'Pure White', 'Silver', 'Solid', 'SPORTY', 'ALL_SEASON', 2, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),

(1, 'Structured Leather Crossbody Bag', 'ACCESSORIES', 'Crossbody Bag', 'Cognac Brown', NULL, 'Solid', 'ELEGANT', 'ALL_SEASON', 1, 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80', true, CURRENT_TIMESTAMP),
(1, 'Chic Cat-Eye Sunglasses', 'ACCESSORIES', 'Sunglasses', 'Black', 'Gold', 'Solid', 'CASUAL', 'ALL_SEASON', 1, 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP),
(1, 'Canvas Gym & Yoga Duffle', 'ACCESSORIES', 'Gym Bag', 'Stone Taupe', NULL, 'Solid', 'SPORTY', 'ALL_SEASON', 1, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80', false, CURRENT_TIMESTAMP);

-- 3. Restart Identity Sequences to avoid collisions with runtime inserts
ALTER TABLE users ALTER COLUMN id RESTART WITH 100;
ALTER TABLE clothing_items ALTER COLUMN id RESTART WITH 100;
ALTER TABLE outfits ALTER COLUMN id RESTART WITH 100;

