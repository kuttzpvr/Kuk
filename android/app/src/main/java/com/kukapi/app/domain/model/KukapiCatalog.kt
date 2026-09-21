package com.kukapi.app.domain.model

object KukapiCatalog {
    val PRODUCTS: List<Product> = listOf(
        Product(
            id = "prod_001",
            title = "Unisex Oversized Classic T-Shirt",
            description = "Engineered for everyday luxury and relaxed streetwear drape. Crafted from 240 GSM ultra-heavy combed compact cotton with biowash treatment for silky handfeel and zero shrinkage.",
            price = 799.0,
            compareAtPrice = 1299.0,
            imageUrl = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
            images = listOf(
                "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1000&q=80"
            ),
            category = "t-shirts",
            sizes = listOf("S", "M", "L", "XL"),
            colors = listOf("Onyx Black", "Sage Green", "Vintage Bone"),
            inStock = true,
            rating = 4.8,
            reviewCount = 142,
            discountPercent = 38
        ),
        Product(
            id = "prod_002",
            title = "Embroidered Chanderi Kurti & Palazzo Set",
            description = "Subtle festive luxury rooted in Indian heritage. Hand-crafted Chanderi silk blend with delicate zari needlework along the yoke and sleeve cuffs.",
            price = 1899.0,
            compareAtPrice = 2999.0,
            imageUrl = "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
            images = listOf(
                "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"
            ),
            category = "kurtis",
            sizes = listOf("S", "M", "L"),
            colors = listOf("Royal Emerald", "Wine Ruby"),
            inStock = true,
            rating = 4.9,
            reviewCount = 96,
            discountPercent = 37
        ),
        Product(
            id = "prod_003",
            title = "Tiered Bohemian Maxi Summer Dress",
            description = "Breezy, youthful, and effortlessly chic. Crafted in 100% fine cotton cambric with elasticated smocked bodice, ruffled tiered skirts, and deep pockets.",
            price = 1599.0,
            compareAtPrice = 2499.0,
            imageUrl = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80",
            images = listOf(
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80"
            ),
            category = "dresses",
            sizes = listOf("S", "M", "L"),
            colors = listOf("Pastel Lilac", "Terracotta Rust"),
            inStock = true,
            rating = 4.7,
            reviewCount = 78,
            discountPercent = 36
        ),
        Product(
            id = "prod_004",
            title = "Relaxed Tactical Cargo Trousers",
            description = "Heavy-duty 100% cotton twill engineered with 6 functional utility pockets, articulated knee darts, and an adjustable toggle hem.",
            price = 1499.0,
            compareAtPrice = 2299.0,
            imageUrl = "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80",
            images = listOf(
                "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=1000&q=80"
            ),
            category = "bottoms",
            sizes = listOf("30", "32", "34"),
            colors = listOf("Army Olive", "Pitch Black"),
            inStock = true,
            rating = 4.8,
            reviewCount = 110,
            discountPercent = 35
        ),
        Product(
            id = "prod_005",
            title = "Bagru Hand Block Printed Anarkali Kurta",
            description = "Artisanal hand block printing using natural vegetable dyes from Bagru, Rajasthan. Flowing 32-kali flared silhouette with wooden button detailing.",
            price = 1399.0,
            compareAtPrice = 2199.0,
            imageUrl = "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80",
            images = listOf(
                "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80"
            ),
            category = "kurtis",
            sizes = listOf("S", "M", "L"),
            colors = listOf("Indigo Dabu"),
            inStock = true,
            rating = 4.6,
            reviewCount = 64,
            discountPercent = 36
        ),
        Product(
            id = "prod_006",
            title = "Drop-Shoulder Boxy Streetwear Tee",
            description = "Minimalist architectural box cut with wider bicep drape. 260 GSM French Terry knit offering superior breathability and structured silhouette.",
            price = 899.0,
            compareAtPrice = 1499.0,
            imageUrl = "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80",
            images = listOf(
                "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1000&q=80"
            ),
            category = "t-shirts",
            sizes = listOf("M", "L"),
            colors = listOf("Oatmeal Heather", "Washed Navy"),
            inStock = true,
            rating = 4.8,
            reviewCount = 89,
            discountPercent = 40
        ),
        Product(
            id = "prod_007",
            title = "Lucknowi Chikankari Hand-Embroidered Kurti",
            description = "Pure modal cotton embellished with intricate Bakhiya and Phanda stitch work crafted by master artisans in Lucknow.",
            price = 1299.0,
            compareAtPrice = 1999.0,
            imageUrl = "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80",
            images = listOf(
                "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80"
            ),
            category = "kurtis",
            sizes = listOf("S", "M", "L"),
            colors = listOf("Blush Rose", "Ivory Pearl"),
            inStock = true,
            rating = 4.9,
            reviewCount = 112,
            discountPercent = 35
        ),
        Product(
            id = "prod_008",
            title = "Short Khadi Handloom Mandarin Kurta",
            description = "Natural textured slub yarn spun on traditional charkha looms. Features coconut shell buttons and a neat side welt pocket.",
            price = 1099.0,
            compareAtPrice = 1699.0,
            imageUrl = "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1000&q=80",
            images = listOf(
                "https://images.unsplash.com/photo-1597983073493-88cd35cf93b0?auto=format&fit=crop&w=1000&q=80"
            ),
            category = "men",
            sizes = listOf("M", "L", "XL"),
            colors = listOf("Mustard Raw"),
            inStock = true,
            rating = 4.7,
            reviewCount = 52,
            discountPercent = 35
        )
    )
}
