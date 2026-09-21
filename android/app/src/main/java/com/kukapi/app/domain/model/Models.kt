package com.kukapi.app.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class Review(
    val id: String,
    val author: String,
    val rating: Int,
    val date: String,
    val comment: String,
    val sizeBought: String? = null,
    val verifiedPurchase: Boolean = true
)

@Serializable
data class Product(
    val id: String,
    val title: String,
    val description: String = "",
    val price: Double,
    val compareAtPrice: Double? = null,
    val imageUrl: String,
    val images: List<String> = emptyList(),
    val category: String = "Apparel",
    val sizes: List<String> = listOf("S", "M", "L", "XL"),
    val colors: List<String> = listOf("Black", "Off-White"),
    val inStock: Boolean = true,
    val rating: Double = 4.8,
    val reviewCount: Int = 24,
    val discountPercent: Int = 0,
    val fabric: String = "100% Combed Compact Cotton",
    val gsm: String = "240 GSM",
    val fit: String = "Boxy Oversized Fit",
    val care: String = "Cold Machine Wash Inside-Out",
    val tags: List<String> = emptyList(),
    val isBestSeller: Boolean = false,
    val isNewArrival: Boolean = false,
    val shopifyUrl: String = "https://kukapi.myshopify.com",
    val reviews: List<Review> = emptyList()
)

@Serializable
data class CartItem(
    val id: String,
    val product: Product,
    val selectedSize: String,
    val selectedColor: String,
    val quantity: Int,
    val price: Double
)

@Serializable
data class ShippingAddress(
    val id: String = java.util.UUID.randomUUID().toString(),
    val name: String,
    val email: String,
    val phone: String,
    val addressLine1: String,
    val addressLine2: String = "",
    val city: String,
    val state: String = "Maharashtra",
    val pincode: String,
    val isDefault: Boolean = false
)

@Serializable
data class AdminConfig(
    val announcement: String = "⚡ FLASH SALE: 240 GSM HEAVYWEIGHT HOODIES LIVE · USE CODE KUKAPI10",
    val freeShippingThreshold: Double = 999.0,
    val shippingFee: Double = 99.0,
    val codFee: Double = 49.0,
    val codAdvance: Double = 199.0,
    val isCodEnabled: Boolean = true
)

@Serializable
data class NotificationItem(
    val id: String,
    val title: String,
    val message: String,
    val time: String,
    val isRead: Boolean = false,
    val type: String = "promo"
)

@Serializable
data class CustomerSession(
    val accessToken: String,
    val expiresAt: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val phone: String = "+91 98200 12345",
    val tier: String = "VIP Gold",
    val points: Int = 850
)

@Serializable
data class OrderItem(
    val title: String,
    val quantity: Int,
    val price: Double,
    val imageUrl: String,
    val variantTitle: String? = null
)

@Serializable
data class CustomerOrder(
    val id: String,
    val orderNumber: String,
    val processedAt: String,
    val totalPrice: Double,
    val financialStatus: String,
    val fulfillmentStatus: String,
    val status: String = "confirmed",
    val estimatedDelivery: String = "3-4 Business Days",
    val carrier: String = "Delhivery Express",
    val trackingNumber: String = "DLV-98741203",
    val items: List<OrderItem> = emptyList()
)

@Serializable
data class ApiDiagnosticInfo(
    val apiUrl: String = "https://kukapi.myshopify.com/api/2024-01/graphql.json",
    val httpStatus: Int = 200,
    val apiError: String? = null,
    val productCount: Int = 0,
    val firstProductTitle: String = "None",
    val firstProductImageUrl: String = "None",
    val latencyMs: Long = 0,
    val timestamp: String = "Just now"
) {
    val httpStatusCode: Int get() = httpStatus
    val parsedProductsCount: Int get() = productCount
    val apiErrorDescription: String get() = apiError ?: "None"
}

