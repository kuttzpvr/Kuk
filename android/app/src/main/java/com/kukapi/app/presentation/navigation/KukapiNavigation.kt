package com.kukapi.app.presentation.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Shop : Screen("shop", "Shop", Icons.Default.ShoppingBag)
    object Search : Screen("search", "Search", Icons.Default.Search)
    object Wishlist : Screen("wishlist", "Wishlist", Icons.Default.Favorite)
    object Account : Screen("account", "Account", Icons.Default.Person)
    object Cart : Screen("cart", "Shopping Bag", Icons.Default.ShoppingCart)
    object Checkout : Screen("checkout", "Checkout", Icons.Default.Payment)
    object OrderTracking : Screen("order_tracking", "Track Order", Icons.Default.LocalShipping)
    object Notifications : Screen("notifications", "Alerts", Icons.Default.Notifications)
    object ProductDetail : Screen("product_detail/{productId}", "Product Details", Icons.Default.ShoppingBag) {
        fun createRoute(productId: String): String {
            val encodedId = java.net.URLEncoder.encode(productId, "UTF-8")
            return "product_detail/$encodedId"
        }
    }
}

val bottomNavScreens = listOf(
    Screen.Home,
    Screen.Shop,
    Screen.Search,
    Screen.Wishlist,
    Screen.Account
)

