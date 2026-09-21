package com.kukapi.app.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.ApiDiagnosticInfo
import com.kukapi.app.domain.model.Product
import com.kukapi.app.presentation.ai.AiStylistDialog

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: ProductViewModel,
    onProductClick: (Product) -> Unit = {},
    onNavigateToCart: () -> Unit = {},
    onNavigateToNotifications: () -> Unit = {}
) {
    val uiState by viewModel.uiState.collectAsState()
    val showDiagnostic by viewModel.showDiagnostic.collectAsState()
    val latestDiagnostic by viewModel.latestDiagnostic.collectAsState()
    val cartItems by viewModel.cartItems.collectAsState()
    val adminConfig by viewModel.adminConfig.collectAsState()

    var selectedCategory by remember { mutableStateOf("all") }
    var showAiStylistDialog by remember { mutableStateOf(false) }

    val categories = listOf(
        "all" to "All",
        "t-shirt" to "T-Shirts",
        "oversized" to "Oversized",
        "tee" to "Tees",
        "kurti" to "Ethnic",
        "top" to "Tops"
    )

    if (showAiStylistDialog) {
        AiStylistDialog(
            viewModel = viewModel,
            onDismiss = { showAiStylistDialog = false },
            onProductClick = { prod ->
                showAiStylistDialog = false
                onProductClick(prod)
            }
        )
    }

    Scaffold(
        topBar = {
            Column {
                // Announcement Ticker Bar
                Surface(
                    color = KukapiBlack,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 4.dp),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = adminConfig.announcement,
                            color = KukapiAmber,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 0.5.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }

                TopAppBar(
                    title = {
                        Column {
                            Text(
                                text = "KUKAPI",
                                fontWeight = FontWeight.Black,
                                letterSpacing = 3.sp,
                                fontSize = 18.sp,
                                color = KukapiBlack
                            )
                            Text(
                                text = "OFFICIAL STOREFRONT",
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                fontSize = 8.sp,
                                color = KukapiZinc500
                            )
                        }
                    },
                    actions = {
                        IconButton(onClick = { showAiStylistDialog = true }) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = "AI Stylist",
                                tint = KukapiAmber
                            )
                        }
                        IconButton(onClick = onNavigateToNotifications) {
                            Icon(
                                imageVector = Icons.Default.Notifications,
                                contentDescription = "Alerts",
                                tint = KukapiZinc900
                            )
                        }
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
                                Icon(
                                    imageVector = Icons.Default.ShoppingBag,
                                    contentDescription = "Cart",
                                    tint = KukapiBlack
                                )
                            }
                        }
                        IconButton(onClick = { viewModel.toggleDiagnostic() }) {
                            Icon(
                                imageVector = Icons.Default.BugReport,
                                contentDescription = "API Diagnostic",
                                tint = if (showDiagnostic) KukapiAmber else KukapiZinc600
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = KukapiWhite
                    )
                )
            }
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(KukapiZinc50)
        ) {
            if (showDiagnostic) {
                DiagnosticScreen(
                    diagnostic = latestDiagnostic ?: ApiDiagnosticInfo(),
                    onClose = { viewModel.toggleDiagnostic(false) },
                    onReTest = { viewModel.loadProducts(refresh = true) }
                )
            } else {
                when (val state = uiState) {
                    is ProductUiState.Loading -> {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            verticalArrangement = Arrangement.Center,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            CircularProgressIndicator(color = KukapiBlack, strokeWidth = 3.dp)
                            Spacer(modifier = Modifier.height(16.dp))
                            Text(
                                text = state.message,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = KukapiZinc500
                            )
                        }
                    }

                    is ProductUiState.Empty -> {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(32.dp),
                            verticalArrangement = Arrangement.Center,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.ShoppingBag,
                                contentDescription = null,
                                tint = KukapiZinc400,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = state.message,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = KukapiZinc900,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = { viewModel.loadProducts(refresh = true) },
                                    colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text("Reload Products")
                                }
                                OutlinedButton(
                                    onClick = { viewModel.toggleDiagnostic(true) },
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text("View Diagnostics")
                                }
                            }
                        }
                    }

                    is ProductUiState.Error -> {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(24.dp),
                            verticalArrangement = Arrangement.Center,
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                imageVector = Icons.Default.Warning,
                                contentDescription = null,
                                tint = Color(0xFFDC2626),
                                modifier = Modifier.size(44.dp)
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = state.title,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = KukapiZinc900
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = state.message,
                                fontSize = 12.sp,
                                color = KukapiZinc500,
                                textAlign = TextAlign.Center
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                if (state.canRetry) {
                                    Button(
                                        onClick = { viewModel.loadProducts(refresh = true) },
                                        colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                                        shape = RoundedCornerShape(12.dp)
                                    ) {
                                        Text("Retry Connection")
                                    }
                                }
                                OutlinedButton(
                                    onClick = { viewModel.toggleDiagnostic(true) },
                                    shape = RoundedCornerShape(12.dp)
                                ) {
                                    Text("Show Diagnostics")
                                }
                            }
                        }
                    }

                    is ProductUiState.Success -> {
                        android.util.Log.i("KUKAPI_PIPELINE", "[UI] products received = ${state.products.size}")
                        val filteredProducts = if (selectedCategory == "all") {
                            state.products
                        } else {
                            state.products.filter {
                                it.category.contains(selectedCategory, ignoreCase = true) ||
                                        it.title.contains(selectedCategory, ignoreCase = true) ||
                                        it.tags.any { tag -> tag.contains(selectedCategory, ignoreCase = true) }
                            }
                        }

                        LazyVerticalGrid(
                            columns = GridCells.Fixed(2),
                            contentPadding = PaddingValues(12.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Hero Banner Header
                            item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                                Card(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(160.dp),
                                    shape = RoundedCornerShape(16.dp),
                                    colors = CardDefaults.cardColors(containerColor = KukapiBlack)
                                ) {
                                    Column(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .padding(20.dp),
                                        verticalArrangement = Arrangement.Center
                                    ) {
                                        Text(
                                            text = "240 GSM HEAVYWEIGHT DROPS",
                                            color = KukapiAmber,
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.5.sp
                                        )
                                        Spacer(modifier = Modifier.height(6.dp))
                                        Text(
                                            text = "STREETWEAR LUXURY",
                                            color = KukapiWhite,
                                            fontSize = 22.sp,
                                            fontWeight = FontWeight.Black,
                                            letterSpacing = 1.sp
                                        )
                                        Text(
                                            text = "Crafted with 100% Combed Compact Cotton",
                                            color = KukapiZinc400,
                                            fontSize = 11.sp
                                        )
                                    }
                                }
                            }

                            // Category Filter Chips
                            item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                                LazyRow(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    items(categories) { (catKey, catLabel) ->
                                        val isSelected = selectedCategory == catKey
                                        Surface(
                                            shape = RoundedCornerShape(20.dp),
                                            color = if (isSelected) KukapiBlack else KukapiWhite,
                                            border = if (isSelected) null else androidx.compose.foundation.BorderStroke(1.dp, KukapiZinc200),
                                            modifier = Modifier.clickable {
                                                selectedCategory = catKey
                                                viewModel.selectCategory(catKey)
                                            }
                                        ) {
                                            Text(
                                                text = catLabel,
                                                fontSize = 11.sp,
                                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                color = if (isSelected) KukapiWhite else KukapiZinc900,
                                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp)
                                            )
                                        }
                                    }
                                }
                            }

                            // Section Title: Trending Drops Count
                            item(span = { androidx.compose.foundation.lazy.grid.GridItemSpan(2) }) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 4.dp, vertical = 2.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "TRENDING DROPS",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 13.sp,
                                        letterSpacing = 1.sp,
                                        color = KukapiBlack
                                    )
                                    Text(
                                        text = "${filteredProducts.size} Items",
                                        fontWeight = FontWeight.SemiBold,
                                        fontSize = 11.sp,
                                        color = KukapiZinc500
                                    )
                                }
                            }

                            // Product Items
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

@Composable
fun DiagnosticScreen(
    diagnostic: ApiDiagnosticInfo,
    onClose: () -> Unit,
    onReTest: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "SHOPIFY API DIAGNOSTICS",
                    color = Color(0xFF38BDF8),
                    fontSize = 14.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
                IconButton(onClick = onClose) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color(0xFF94A3B8)
                    )
                }
            }

            Divider(color = Color(0xFF334155), modifier = Modifier.padding(vertical = 12.dp))

            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                DiagnosticRow("HTTP Status Code", "${diagnostic.httpStatus}", diagnostic.httpStatus == 200)
                DiagnosticRow("Parsed Products Count", "${diagnostic.productCount}", diagnostic.productCount > 0)
                DiagnosticRow("First Product", diagnostic.firstProductTitle, diagnostic.firstProductTitle.isNotBlank())
                DiagnosticRow("First Image URL", diagnostic.firstProductImageUrl, diagnostic.firstProductImageUrl.isNotBlank())
                DiagnosticRow("API Error Description", diagnostic.apiError ?: "None", diagnostic.apiError == null)
                DiagnosticRow("Last Checked", diagnostic.timestamp, true)
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Button(
                    onClick = onReTest,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF38BDF8)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Re-Test API", color = Color(0xFF0F172A), fontWeight = FontWeight.Bold)
                }
                OutlinedButton(
                    onClick = onClose,
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Close", color = Color(0xFF94A3B8))
                }
            }
        }
    }
}

@Composable
fun DiagnosticRow(
    label: String,
    value: String,
    highlight: Boolean
) {
    Column {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF94A3B8)
        )
        Spacer(modifier = Modifier.height(2.dp))
        Text(
            text = value,
            fontSize = 13.sp,
            fontFamily = FontFamily.Monospace,
            fontWeight = FontWeight.Bold,
            color = if (highlight) Color(0xFF4ADE80) else Color(0xFFF1F5F9),
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
fun ProductCard(
    product: Product,
    onClick: () -> Unit = {},
    isWishlisted: Boolean = false,
    onWishlistToggle: () -> Unit = {}
) {
    val context = LocalContext.current

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = KukapiWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .background(KukapiZinc100)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(context)
                        .data(product.imageUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = product.title,
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp)),
                    contentScale = ContentScale.Crop
                )

                // GSM Badge
                Surface(
                    color = KukapiBlack.copy(alpha = 0.8f),
                    shape = RoundedCornerShape(bottomEnd = 6.dp),
                    modifier = Modifier.align(Alignment.TopStart)
                ) {
                    Text(
                        text = product.gsm,
                        color = KukapiWhite,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Black,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }

                // Wishlist Toggle Heart
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(6.dp)
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(KukapiWhite.copy(alpha = 0.9f))
                        .clickable(onClick = onWishlistToggle),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = if (isWishlisted) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Wishlist",
                        tint = if (isWishlisted) KukapiRose else KukapiZinc700,
                        modifier = Modifier.size(16.dp)
                    )
                }

                if (product.discountPercent > 0) {
                    Surface(
                        color = KukapiAmber,
                        shape = RoundedCornerShape(topStart = 6.dp),
                        modifier = Modifier.align(Alignment.BottomEnd)
                    ) {
                        Text(
                            text = "${product.discountPercent}% OFF",
                            color = KukapiBlack,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.ExtraBold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
            }

            Column(modifier = Modifier.padding(10.dp)) {
                Text(
                    text = product.title,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = KukapiZinc900,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "₹${product.price.toInt()}",
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp,
                        color = KukapiBlack
                    )
                    product.compareAtPrice?.let { comparePrice ->
                        if (comparePrice > product.price) {
                            Text(
                                text = "₹${comparePrice.toInt()}",
                                color = KukapiZinc400,
                                fontSize = 11.sp,
                                style = androidx.compose.ui.text.TextStyle(
                                    textDecoration = TextDecoration.LineThrough
                                )
                            )
                        }
                    }
                }
            }
        }
    }
}
