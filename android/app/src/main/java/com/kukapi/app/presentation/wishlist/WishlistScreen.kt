package com.kukapi.app.presentation.wishlist

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.Product
import com.kukapi.app.presentation.home.ProductCard
import com.kukapi.app.presentation.home.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WishlistScreen(
    viewModel: ProductViewModel,
    onProductClick: (Product) -> Unit,
    onExploreShop: () -> Unit
) {
    val wishlistIds by viewModel.wishlist.collectAsState()
    val allProducts = viewModel.getAllProducts()
    val wishlistProducts = remember(wishlistIds, allProducts) {
        allProducts.filter { it.id in wishlistIds }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "MY WISHLIST",
                            fontWeight = FontWeight.Black,
                            letterSpacing = 2.sp,
                            fontSize = 16.sp,
                            color = KukapiBlack
                        )
                        Text(
                            text = "${wishlistProducts.size} SAVED STYLES",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 10.sp,
                            color = KukapiZinc500
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
            if (wishlistProducts.isEmpty()) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Surface(
                        shape = RoundedCornerShape(50),
                        color = KukapiZinc100,
                        modifier = Modifier.size(80.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.Default.FavoriteBorder,
                                contentDescription = null,
                                tint = KukapiZinc400,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Your Wishlist is Empty",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = KukapiZinc900
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Save your favorite oversized tees and drops to keep track of sales and restocks.",
                        fontSize = 13.sp,
                        color = KukapiZinc500,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(20.dp))
                    Button(
                        onClick = onExploreShop,
                        colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.height(44.dp)
                    ) {
                        Icon(Icons.Default.ShoppingBag, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("EXPLORE SHOP", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            } else {
                LazyVerticalGrid(
                    columns = GridCells.Fixed(2),
                    contentPadding = PaddingValues(16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(wishlistProducts, key = { it.id }) { product ->
                        ProductCard(
                            product = product,
                            onClick = { onProductClick(product) },
                            isWishlisted = true,
                            onWishlistToggle = { viewModel.toggleWishlist(product.id) }
                        )
                    }
                }
            }
        }
    }
}
