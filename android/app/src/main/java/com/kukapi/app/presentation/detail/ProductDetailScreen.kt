package com.kukapi.app.presentation.detail

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.Product
import com.kukapi.app.presentation.home.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProductDetailScreen(
    product: Product,
    viewModel: ProductViewModel,
    onBack: () -> Unit,
    onNavigateToCart: () -> Unit = {},
    onNavigateToCheckout: () -> Unit = {}
) {
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val isWishlisted = viewModel.isInWishlist(product.id)

    var selectedImageIndex by remember { mutableStateOf(0) }
    var selectedSize by remember { mutableStateOf(product.sizes.firstOrNull() ?: "M") }
    var selectedColor by remember { mutableStateOf(product.colors.firstOrNull() ?: "Black") }
    var quantity by remember { mutableStateOf(1) }
    var showAddedSnackbar by remember { mutableStateOf(false) }
    var showSizeChart by remember { mutableStateOf(false) }

    // Pincode checker state
    var pincodeInput by remember { mutableStateOf("") }
    var pincodeChecked by remember { mutableStateOf(false) }

    val imagesList = if (product.images.isNotEmpty()) product.images else listOf(product.imageUrl)
    val currentImage = imagesList.getOrElse(selectedImageIndex) { product.imageUrl }

    if (showSizeChart) {
        SizeChartDialog(onDismiss = { showSizeChart = false })
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "KUKAPI APPAREL",
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            letterSpacing = 2.sp,
                            color = KukapiBlack
                        )
                        Text(
                            text = product.category.uppercase(),
                            fontSize = 10.sp,
                            color = KukapiZinc500,
                            letterSpacing = 1.sp
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = KukapiBlack
                        )
                    }
                },
                actions = {
                    IconButton(onClick = {
                        val shareIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, "Check out ${product.title} on KUKAPI: ₹${product.price.toInt()} - ${product.gsm} Heavyweight luxury streetwear")
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Share Garment"))
                    }) {
                        Icon(imageVector = Icons.Default.Share, contentDescription = "Share", tint = KukapiBlack)
                    }
                    IconButton(onClick = { viewModel.toggleWishlist(product.id) }) {
                        Icon(
                            imageVector = if (isWishlisted) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Wishlist",
                            tint = if (isWishlisted) KukapiRose else KukapiBlack
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KukapiWhite)
            )
        },
        bottomBar = {
            Surface(
                color = KukapiWhite,
                shadowElevation = 16.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Add to Bag Button
                    OutlinedButton(
                        onClick = {
                            viewModel.addToCart(product, selectedSize, selectedColor, quantity)
                            showAddedSnackbar = true
                        },
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1f)
                            .height(50.dp),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = KukapiBlack)
                    ) {
                        Icon(imageVector = Icons.Default.ShoppingBag, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = if (showAddedSnackbar) "Added ✓" else "Add to Bag",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp
                        )
                    }

                    // Buy Now Button
                    Button(
                        onClick = {
                            viewModel.addToCart(product, selectedSize, selectedColor, quantity)
                            onNavigateToCheckout()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .weight(1.2f)
                            .height(50.dp)
                    ) {
                        Text(
                            text = "Buy Now · ₹${(product.price * quantity).toInt()}",
                            fontWeight = FontWeight.Black,
                            fontSize = 13.sp,
                            color = KukapiWhite
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(KukapiZinc50)
                .verticalScroll(scrollState)
        ) {
            // Main Hero Image with Badges
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(0.95f)
                    .background(KukapiZinc100)
            ) {
                AsyncImage(
                    model = currentImage,
                    contentDescription = product.title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // GSM Badge
                Surface(
                    color = KukapiBlack.copy(alpha = 0.85f),
                    shape = RoundedCornerShape(6.dp),
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(14.dp)
                ) {
                    Text(
                        text = product.gsm,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        color = KukapiWhite,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }

                // Discount Badge
                if (product.discountPercent > 0) {
                    Surface(
                        color = KukapiRose,
                        shape = RoundedCornerShape(6.dp),
                        modifier = Modifier
                            .align(Alignment.TopEnd)
                            .padding(14.dp)
                    ) {
                        Text(
                            text = "-${product.discountPercent}% OFF",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Black,
                            color = KukapiWhite,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                        )
                    }
                }
            }

            // Image Thumbnails Carousel
            if (imagesList.size > 1) {
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    itemsIndexed(imagesList) { index, imgUrl ->
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .border(
                                    width = if (selectedImageIndex == index) 2.dp else 1.dp,
                                    color = if (selectedImageIndex == index) KukapiBlack else KukapiZinc300,
                                    shape = RoundedCornerShape(8.dp)
                                )
                                .clickable { selectedImageIndex = index }
                        ) {
                            AsyncImage(
                                model = imgUrl,
                                contentDescription = null,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }
                }
            }

            // Main Product Details Section
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                // Title and Rating
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = product.title,
                        fontWeight = FontWeight.Black,
                        fontSize = 20.sp,
                        color = KukapiBlack,
                        modifier = Modifier.weight(1f)
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = KukapiAmber.copy(alpha = 0.15f),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Star, contentDescription = null, tint = KukapiAmber, modifier = Modifier.size(12.dp))
                            Spacer(modifier = Modifier.width(3.dp))
                            Text(text = "${product.rating}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = KukapiZinc900)
                        }
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "(${product.reviewCount} verified reviews)", fontSize = 12.sp, color = KukapiZinc500)
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Price Row
                Row(
                    verticalAlignment = Alignment.Baseline,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "₹${product.price.toInt()}",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = KukapiBlack
                    )
                    product.compareAtPrice?.let { comparePrice ->
                        if (comparePrice > product.price) {
                            Text(
                                text = "₹${comparePrice.toInt()}",
                                fontSize = 15.sp,
                                color = KukapiZinc400,
                                textDecoration = TextDecoration.LineThrough
                            )
                            Surface(
                                color = KukapiEmerald.copy(alpha = 0.12f),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    text = "Save ₹${(comparePrice - product.price).toInt()}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = KukapiEmerald,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }

                Text(
                    text = "Inclusive of all GST taxes · Free shipping on orders above ₹999",
                    fontSize = 11.sp,
                    color = KukapiZinc500,
                    modifier = Modifier.padding(top = 2.dp)
                )

                Divider(modifier = Modifier.padding(vertical = 16.dp), color = KukapiZinc200)

                // Color Selection
                Text(
                    text = "SELECT COLOR (${selectedColor})",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp,
                    color = KukapiZinc500
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    product.colors.forEach { color ->
                        val isSelected = selectedColor == color
                        Surface(
                            color = if (isSelected) KukapiBlack else KukapiWhite,
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) KukapiBlack else KukapiZinc300),
                            modifier = Modifier.clickable { selectedColor = color }
                        ) {
                            Text(
                                text = color,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) KukapiWhite else KukapiBlack,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Size Selection with Size Chart Button
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "SELECT SIZE (${selectedSize})",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp,
                        color = KukapiZinc500
                    )
                    TextButton(
                        onClick = { showSizeChart = true },
                        contentPadding = PaddingValues(0.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Straighten, contentDescription = null, modifier = Modifier.size(14.dp), tint = KukapiBlack)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Size Guide", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    product.sizes.forEach { size ->
                        val isSelected = selectedSize == size
                        Surface(
                            color = if (isSelected) KukapiBlack else KukapiWhite,
                            shape = RoundedCornerShape(8.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, if (isSelected) KukapiBlack else KukapiZinc300),
                            modifier = Modifier.clickable { selectedSize = size }
                        ) {
                            Text(
                                text = size,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) KukapiWhite else KukapiBlack,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Quantity Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "QUANTITY",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp,
                        color = KukapiZinc500
                    )
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(KukapiZinc100)
                    ) {
                        IconButton(
                            onClick = { if (quantity > 1) quantity-- },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Remove, contentDescription = null, modifier = Modifier.size(14.dp), tint = KukapiBlack)
                        }
                        Text(
                            text = "$quantity",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = KukapiBlack,
                            modifier = Modifier.padding(horizontal = 8.dp)
                        )
                        IconButton(
                            onClick = { quantity++ },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Add, contentDescription = null, modifier = Modifier.size(14.dp), tint = KukapiBlack)
                        }
                    }
                }

                Divider(modifier = Modifier.padding(vertical = 16.dp), color = KukapiZinc200)

                // Pincode Delivery Availability Checker
                Card(
                    colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.LocalShipping, contentDescription = null, tint = KukapiBlack, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("CHECK DELIVERY & CASH ON DELIVERY", fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, color = KukapiBlack)
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            OutlinedTextField(
                                value = pincodeInput,
                                onValueChange = { pincodeInput = it },
                                placeholder = { Text("Enter 6-digit Pincode", fontSize = 11.sp, color = KukapiZinc400) },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp),
                                shape = RoundedCornerShape(8.dp),
                                singleLine = true
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(
                                onClick = { if (pincodeInput.length >= 6) pincodeChecked = true },
                                colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.height(48.dp)
                            ) {
                                Text("Check", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = KukapiWhite)
                            }
                        }
                        if (pincodeChecked) {
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.CheckCircle, contentDescription = null, tint = KukapiEmerald, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Delivery by Delhivery Air Express in 2-3 Days · COD Available",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = KukapiEmerald
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Craftsmanship & Specifications Grid
                Card(
                    colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("GARMENT SPECIFICATIONS", fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, color = KukapiZinc500)
                        Spacer(modifier = Modifier.height(12.dp))
                        SpecRow("Fabric Composition", product.fabric)
                        SpecRow("Fabric Weight", product.gsm)
                        SpecRow("Silhouette / Fit", product.fit)
                        SpecRow("Care Instructions", product.care)
                        SpecRow("Dispatch Time", "Within 24 Hours from Hub")
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Verified Customer Reviews
                Card(
                    colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("BUYER REVIEWS (${product.reviews.size})", fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, color = KukapiZinc500)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(imageVector = Icons.Default.Star, contentDescription = null, tint = KukapiAmber, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(2.dp))
                                Text("4.8 / 5.0", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                            }
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        product.reviews.forEachIndexed { idx, review ->
                            Column {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text(review.author, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                                    Text(review.date, fontSize = 10.sp, color = KukapiZinc400)
                                }
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 2.dp)) {
                                    repeat(review.rating) {
                                        Icon(imageVector = Icons.Default.Star, contentDescription = null, tint = KukapiAmber, modifier = Modifier.size(10.dp))
                                    }
                                    review.sizeBought?.let {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Text("Size bought: $it", fontSize = 10.sp, color = KukapiZinc500)
                                    }
                                }
                                Text(review.comment, fontSize = 11.sp, color = KukapiZinc700, lineHeight = 15.sp)
                                if (idx < product.reviews.size - 1) {
                                    Divider(modifier = Modifier.padding(vertical = 8.dp), color = KukapiZinc100)
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun SpecRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(label, fontSize = 12.sp, color = KukapiZinc500)
        Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
    }
}
