package com.kukapi.app.presentation.shop

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.Product
import com.kukapi.app.presentation.home.ProductCard
import com.kukapi.app.presentation.home.ProductUiState
import com.kukapi.app.presentation.home.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ShopScreen(
    viewModel: ProductViewModel,
    onProductClick: (Product) -> Unit,
    onNavigateToCart: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val cartItems by viewModel.cartItems.collectAsState()

    var selectedCategory by remember { mutableStateOf("all") }
    var selectedGsm by remember { mutableStateOf("all") }
    var sortBy by remember { mutableStateOf("featured") } // featured, price_low, price_high, rating

    val categories = listOf(
        "all" to "All Categories",
        "t-shirt" to "T-Shirts",
        "oversized" to "Oversized",
        "tee" to "Heavy Tees",
        "kurti" to "Ethnic Luxury",
        "top" to "Crop Tops"
    )

    val gsmOptions = listOf("all", "240 GSM", "220 GSM", "180 GSM")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "CATALOG & DROPS",
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp,
                            fontSize = 16.sp,
                            color = KukapiBlack
                        )
                        Text(
                            text = "34 Live Shopify Products",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 10.sp,
                            color = KukapiEmerald
                        )
                    }
                },
                actions = {
                    IconButton(onClick = onNavigateToCart) {
                        BadgedBox(
                            badge = {
                                if (cartItems.isNotEmpty()) {
                                    Badge(
                                        containerColor = KukapiBlack,
                                        contentColor = KukapiWhite
                                    ) {
                                        Text("${cartItems.sumOf { it.quantity }}")
                                    }
                                }
                            }
                        ) {
                            Icon(imageVector = Icons.Default.ShoppingBag, contentDescription = "Cart", tint = KukapiBlack)
                        }
                    }
                    IconButton(onClick = { viewModel.loadProducts(refresh = true) }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = KukapiBlack
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KukapiWhite)
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(KukapiZinc50)
        ) {
            when (val state = uiState) {
                is ProductUiState.Loading -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator(color = KukapiBlack)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text(state.message, color = KukapiZinc500, fontSize = 13.sp)
                    }
                }

                is ProductUiState.Empty -> {
                    Column(
                        modifier = Modifier.fillMaxSize(),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(imageVector = Icons.Default.ShoppingBag, contentDescription = null, modifier = Modifier.size(48.dp), tint = KukapiZinc400)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("No products in catalog", fontWeight = FontWeight.Bold, color = KukapiBlack)
                    }
                }

                is ProductUiState.Error -> {
                    Column(
                        modifier = Modifier.fillMaxSize().padding(24.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(imageVector = Icons.Default.ErrorOutline, contentDescription = null, modifier = Modifier.size(48.dp), tint = KukapiRose)
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Error Loading Products", fontWeight = FontWeight.Bold, color = KukapiBlack)
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(state.message, fontSize = 12.sp, color = KukapiZinc500)
                        Spacer(modifier = Modifier.height(16.dp))
                        Button(onClick = { viewModel.loadProducts(refresh = true) }, colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack)) {
                            Text("Retry Shopify Sync")
                        }
                    }
                }

                is ProductUiState.Success -> {
                    // Filter and Sort Logic
                    val filteredProducts = state.products.filter { product ->
                        val matchesCategory = if (selectedCategory == "all") true else {
                            product.category.contains(selectedCategory, ignoreCase = true) ||
                                    product.title.contains(selectedCategory, ignoreCase = true) ||
                                    product.tags.any { it.contains(selectedCategory, ignoreCase = true) }
                        }
                        val matchesGsm = if (selectedGsm == "all") true else {
                            product.gsm.contains(selectedGsm, ignoreCase = true)
                        }
                        matchesCategory && matchesGsm
                    }.let { list ->
                        when (sortBy) {
                            "price_low" -> list.sortedBy { it.price }
                            "price_high" -> list.sortedByDescending { it.price }
                            "rating" -> list.sortedByDescending { it.rating }
                            else -> list // "featured"
                        }
                    }

                    Column(modifier = Modifier.fillMaxSize()) {
                        // Category Pills Carousel
                        LazyRow(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(KukapiWhite)
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(categories) { (slug, label) ->
                                val isSelected = selectedCategory == slug
                                Surface(
                                    color = if (isSelected) KukapiBlack else KukapiZinc100,
                                    shape = RoundedCornerShape(20.dp),
                                    modifier = Modifier.clickable { selectedCategory = slug }
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) KukapiWhite else KukapiZinc800,
                                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                                    )
                                }
                            }
                        }

                        // Filter Toolbar: GSM selection & Sort By
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(KukapiWhite)
                                .padding(horizontal = 16.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // GSM chips
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                gsmOptions.forEach { gsm ->
                                    val isGsmSelected = selectedGsm == gsm
                                    Surface(
                                        color = if (isGsmSelected) KukapiZinc800 else KukapiZinc100,
                                        shape = RoundedCornerShape(6.dp),
                                        modifier = Modifier.clickable { selectedGsm = gsm }
                                    ) {
                                        Text(
                                            text = if (gsm == "all") "All Fabric" else gsm,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isGsmSelected) KukapiWhite else KukapiZinc600,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 3.dp)
                                        )
                                    }
                                }
                            }

                            // Sort selector
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "${filteredProducts.size} Items",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = KukapiZinc500
                                )
                            }
                        }

                        Divider(color = KukapiZinc200)

                        // 2-Column Product Grid
                        LazyVerticalGrid(
                            columns = GridCells.Fixed(2),
                            contentPadding = PaddingValues(16.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                            verticalArrangement = Arrangement.spacedBy(16.dp),
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(filteredProducts, key = { it.id }) { product ->
                                ProductCard(
                                    product = product,
                                    onClick = { onProductClick(product) },
                                    isWishlisted = viewModel.isInWishlist(product.id),
                                    onWishlistToggle = { viewModel.toggleWishlist(product.id) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
