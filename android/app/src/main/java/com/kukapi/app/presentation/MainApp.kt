package com.kukapi.app.presentation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.kukapi.app.core.designsystem.KukapiBlack
import com.kukapi.app.core.designsystem.KukapiWhite
import com.kukapi.app.domain.model.Product
import com.kukapi.app.presentation.account.AccountScreen
import com.kukapi.app.presentation.cart.CartScreen
import com.kukapi.app.presentation.checkout.CheckoutScreen
import com.kukapi.app.presentation.detail.ProductDetailScreen
import com.kukapi.app.presentation.home.HomeScreen
import com.kukapi.app.presentation.home.ProductViewModel
import com.kukapi.app.presentation.navigation.Screen
import com.kukapi.app.presentation.navigation.bottomNavScreens
import com.kukapi.app.presentation.notifications.NotificationsScreen
import com.kukapi.app.presentation.orders.OrderTrackingScreen
import com.kukapi.app.presentation.search.SearchScreen
import com.kukapi.app.presentation.shop.ShopScreen
import com.kukapi.app.presentation.wishlist.WishlistScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun KukapiMainApp(
    viewModel: ProductViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    var activeProductForDetail by remember { mutableStateOf<Product?>(null) }
    val showBottomBar = currentRoute in bottomNavScreens.map { it.route }

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = KukapiWhite,
                    tonalElevation = 8.dp
                ) {
                    bottomNavScreens.forEach { screen ->
                        val isSelected = currentRoute == screen.route
                        NavigationBarItem(
                            selected = isSelected,
                            onClick = {
                                if (currentRoute != screen.route) {
                                    navController.navigate(screen.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            icon = { Icon(screen.icon, contentDescription = screen.title) },
                            label = { Text(screen.title, fontSize = 10.sp) }
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // 1. HOME SCREEN
            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = viewModel,
                    onProductClick = { product ->
                        activeProductForDetail = product
                        navController.navigate(Screen.ProductDetail.createRoute(product.id))
                    },
                    onNavigateToCart = { navController.navigate(Screen.Cart.route) },
                    onNavigateToNotifications = { navController.navigate(Screen.Notifications.route) }
                )
            }

            // 2. SHOP SCREEN
            composable(Screen.Shop.route) {
                ShopScreen(
                    viewModel = viewModel,
                    onProductClick = { product ->
                        activeProductForDetail = product
                        navController.navigate(Screen.ProductDetail.createRoute(product.id))
                    },
                    onNavigateToCart = { navController.navigate(Screen.Cart.route) }
                )
            }

            // 3. SEARCH SCREEN
            composable(Screen.Search.route) {
                SearchScreen(
                    viewModel = viewModel,
                    onProductClick = { product ->
                        activeProductForDetail = product
                        navController.navigate(Screen.ProductDetail.createRoute(product.id))
                    }
                )
            }

            // 4. WISHLIST SCREEN
            composable(Screen.Wishlist.route) {
                WishlistScreen(
                    viewModel = viewModel,
                    onProductClick = { product ->
                        activeProductForDetail = product
                        navController.navigate(Screen.ProductDetail.createRoute(product.id))
                    },
                    onExploreShop = {
                        navController.navigate(Screen.Shop.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }

            // 5. ACCOUNT SCREEN
            composable(Screen.Account.route) {
                AccountScreen(
                    viewModel = viewModel,
                    onOpenWishlist = {
                        navController.navigate(Screen.Wishlist.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onTrackOrder = { order ->
                        navController.navigate(Screen.OrderTracking.route)
                    },
                    onOpenNotifications = {
                        navController.navigate(Screen.Notifications.route)
                    }
                )
            }

            // 6. CART / BAG SCREEN
            composable(Screen.Cart.route) {
                CartScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() },
                    onCheckout = { navController.navigate(Screen.Checkout.route) },
                    onShopNow = {
                        navController.navigate(Screen.Shop.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }

            // 7. CHECKOUT SCREEN
            composable(Screen.Checkout.route) {
                CheckoutScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() },
                    onOrderPlaced = { order ->
                        navController.navigate(Screen.OrderTracking.route) {
                            popUpTo(Screen.Home.route)
                        }
                    }
                )
            }

            // 8. ORDER TRACKING SCREEN
            composable(Screen.OrderTracking.route) {
                OrderTrackingScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            // 9. NOTIFICATIONS SCREEN
            composable(Screen.Notifications.route) {
                NotificationsScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            // 10. PRODUCT DETAILS SCREEN
            composable(Screen.ProductDetail.route) { backStackEntry ->
                val encodedId = backStackEntry.arguments?.getString("productId") ?: ""
                val decodedId = try {
                    java.net.URLDecoder.decode(encodedId, "UTF-8")
                } catch (e: Exception) {
                    encodedId
                }

                val allProducts = viewModel.getAllProducts()
                val product = activeProductForDetail
                    ?: allProducts.find { it.id == decodedId || it.id == encodedId }
                    ?: allProducts.firstOrNull()

                if (product != null) {
                    ProductDetailScreen(
                        product = product,
                        viewModel = viewModel,
                        onBack = { navController.popBackStack() },
                        onNavigateToCart = { navController.navigate(Screen.Cart.route) },
                        onNavigateToCheckout = { navController.navigate(Screen.Checkout.route) }
                    )
                }
            }
        }
    }
}
