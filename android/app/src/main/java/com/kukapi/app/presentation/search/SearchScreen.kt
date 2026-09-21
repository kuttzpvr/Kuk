package com.kukapi.app.presentation.search

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
fun SearchScreen(
    viewModel: ProductViewModel,
    onProductClick: (Product) -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    val searchHistory by viewModel.searchHistory.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    val popularTags = listOf("240 GSM", "Riders", "Oversized", "Vintage", "Chanderi Silk", "Acid Wash", "T-Shirt")

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    OutlinedTextField(
                        value = searchQuery,
                        onValueChange = {
                            searchQuery = it
                            if (it.isNotBlank()) viewModel.addSearchHistory(it.trim())
                        },
                        placeholder = { Text("Search 34 Shopify styles & GSM...", fontSize = 13.sp, color = KukapiZinc400) },
                        leadingIcon = {
                            Icon(Icons.Default.Search, contentDescription = "Search", tint = KukapiZinc500, modifier = Modifier.size(20.dp))
                        },
                        trailingIcon = {
                            if (searchQuery.isNotEmpty()) {
                                IconButton(onClick = { searchQuery = "" }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear", tint = KukapiZinc500, modifier = Modifier.size(18.dp))
                                }
                            }
                        },
                        singleLine = true,
                        shape = RoundedCornerShape(12.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = KukapiZinc100,
                            unfocusedContainerColor = KukapiZinc100,
                            focusedBorderColor = KukapiBlack,
                            unfocusedBorderColor = KukapiZinc200
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(end = 12.dp)
                            .height(50.dp)
                    )
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
                is ProductUiState.Success -> {
                    val filteredProducts = remember(state.products, searchQuery) {
                        if (searchQuery.isBlank()) {
                            state.products
                        } else {
                            val q = searchQuery.trim().lowercase()
                            state.products.filter {
                                it.title.lowercase().contains(q) ||
                                        it.category.lowercase().contains(q) ||
                                        it.gsm.lowercase().contains(q) ||
                                        it.fabric.lowercase().contains(q) ||
                                        it.tags.any { tag -> tag.lowercase().contains(q) } ||
                                        it.description.lowercase().contains(q)
                            }
                        }
                    }

                    Column(modifier = Modifier.fillMaxSize()) {
                        // Quick Search Tag Suggestions
                        LazyRow(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(KukapiWhite)
                                .padding(horizontal = 16.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(popularTags) { tag ->
                                Surface(
                                    color = if (searchQuery == tag) KukapiBlack else KukapiZinc100,
                                    shape = RoundedCornerShape(20.dp),
                                    modifier = Modifier.clickable {
                                        searchQuery = tag
                                        viewModel.addSearchHistory(tag)
                                    }
                                ) {
                                    Text(
                                        text = tag,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (searchQuery == tag) KukapiWhite else KukapiZinc700,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                                    )
                                }
                            }
                        }

                        // Search History row if available
                        if (searchQuery.isBlank() && searchHistory.isNotEmpty()) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 6.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Recent Searches", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = KukapiZinc500)
                                TextButton(onClick = { viewModel.clearSearchHistory() }) {
                                    Text("Clear", fontSize = 11.sp, color = KukapiRose)
                                }
                            }
                        }

                        Divider(color = KukapiZinc200)

                        if (filteredProducts.isEmpty()) {
                            Box(
                                modifier = Modifier.fillMaxSize(),
                                contentAlignment = Alignment.Center
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Icon(imageVector = Icons.Default.SearchOff, contentDescription = null, tint = KukapiZinc400, modifier = Modifier.size(48.dp))
                                    Spacer(modifier = Modifier.height(10.dp))
                                    Text("No matching styles found", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = KukapiBlack)
                                    Text("Try searching for '240 GSM', 'Riders', or 'Oversized'", fontSize = 12.sp, color = KukapiZinc500)
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

                else -> {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        CircularProgressIndicator(color = KukapiBlack)
                    }
                }
            }
        }
    }
}
