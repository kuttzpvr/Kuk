package com.kukapi.app.presentation.cart

import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.CartItem
import com.kukapi.app.presentation.home.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    viewModel: ProductViewModel,
    onBack: () -> Unit = {},
    onCheckout: () -> Unit = {},
    onShopNow: () -> Unit = {}
) {
    val cartItems by viewModel.cartItems.collectAsState()
    val appliedCoupon by viewModel.appliedCoupon.collectAsState()
    val couponError by viewModel.couponError.collectAsState()
    val adminConfig by viewModel.adminConfig.collectAsState()

    var couponInput by remember { mutableStateOf("") }

    val subtotal = viewModel.getCartSubtotal()
    val discount = viewModel.getDiscountAmount()
    val shipping = viewModel.getShippingFee()
    val total = viewModel.getGrandTotal()

    val freeShippingGoal = adminConfig.freeShippingThreshold
    val progress = if (freeShippingGoal > 0) (subtotal / freeShippingGoal).coerceIn(0.0, 1.0).toFloat() else 1f
    val remainingForFreeShipping = (freeShippingGoal - subtotal).coerceAtLeast(0.0)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "SHOPPING BAG",
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp,
                            letterSpacing = 2.sp,
                            color = KukapiBlack
                        )
                        Text(
                            text = "${cartItems.sumOf { it.quantity }} items selected",
                            fontSize = 11.sp,
                            color = KukapiZinc500
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = KukapiBlack)
                    }
                },
                actions = {
                    if (cartItems.isNotEmpty()) {
                        TextButton(onClick = { viewModel.clearCart() }) {
                            Text("Clear", color = KukapiRose, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KukapiWhite)
            )
        }
    ) { paddingValues ->
        if (cartItems.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(KukapiZinc50),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.padding(32.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(72.dp)
                            .clip(RoundedCornerShape(36.dp))
                            .background(KukapiZinc200.copy(alpha = 0.5f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.ShoppingBag,
                            contentDescription = "Empty Bag",
                            modifier = Modifier.size(36.dp),
                            tint = KukapiZinc500
                        )
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Text(
                        text = "Your Bag is Empty",
                        fontWeight = FontWeight.ExtraBold,
                        fontSize = 18.sp,
                        color = KukapiBlack
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Explore heavy 240 GSM tees and luxury cuts to upgrade your wardrobe.",
                        fontSize = 13.sp,
                        color = KukapiZinc500,
                        textAlign = TextAlign.Center
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Button(
                        onClick = onShopNow,
                        colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.height(48.dp)
                    ) {
                        Text("Explore Drops", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = KukapiWhite)
                    }
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .background(KukapiZinc50)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                item {
                    Spacer(modifier = Modifier.height(4.dp))
                    // Free Shipping Progress Bar Card
                    Card(
                        colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Icon(
                                        imageVector = Icons.Default.LocalShipping,
                                        contentDescription = "Shipping",
                                        modifier = Modifier.size(16.dp),
                                        tint = if (remainingForFreeShipping == 0.0) KukapiEmerald else KukapiZinc800
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(
                                        text = if (remainingForFreeShipping == 0.0) "Unlocked Free Express Shipping!" else "Add ₹${remainingForFreeShipping.toInt()} for Free Shipping",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = if (remainingForFreeShipping == 0.0) KukapiEmerald else KukapiZinc900
                                    )
                                }
                                Text(
                                    text = "${(progress * 100).toInt()}%",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = KukapiZinc500
                                )
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            LinearProgressIndicator(
                                progress = { progress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(6.dp)
                                    .clip(RoundedCornerShape(3.dp)),
                                color = if (remainingForFreeShipping == 0.0) KukapiEmerald else KukapiBlack,
                                trackColor = KukapiZinc200
                            )
                        }
                    }
                }

                items(cartItems, key = { it.id }) { item ->
                    CartItemRow(
                        item = item,
                        onIncrement = { viewModel.updateCartQuantity(item.id, 1) },
                        onDecrement = { viewModel.updateCartQuantity(item.id, -1) },
                        onRemove = { viewModel.removeFromCart(item.id) }
                    )
                }

                item {
                    // Coupon Code Input Card
                    Card(
                        colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(
                                text = "PROMO CODE / VOUCHER",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = KukapiZinc500
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                OutlinedTextField(
                                    value = couponInput,
                                    onValueChange = { couponInput = it },
                                    placeholder = { Text("e.g. KUKAPI10", fontSize = 12.sp, color = KukapiZinc400) },
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(50.dp),
                                    shape = RoundedCornerShape(10.dp),
                                    singleLine = true,
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = KukapiBlack,
                                        unfocusedBorderColor = KukapiZinc300
                                    )
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Button(
                                    onClick = {
                                        if (appliedCoupon != null) {
                                            viewModel.removeCoupon()
                                            couponInput = ""
                                        } else {
                                            viewModel.applyCoupon(couponInput)
                                        }
                                    },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = if (appliedCoupon != null) KukapiRose else KukapiBlack
                                    ),
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.height(50.dp)
                                ) {
                                    Text(
                                        text = if (appliedCoupon != null) "Remove" else "Apply",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 12.sp,
                                        color = KukapiWhite
                                    )
                                }
                            }
                            if (appliedCoupon != null) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = "✓ Coupon '$appliedCoupon' applied successfully!",
                                    color = KukapiEmerald,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            if (couponError != null) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    text = couponError ?: "",
                                    color = KukapiRose,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }
                }

                item {
                    // Order Summary Breakdown
                    Card(
                        colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "PRICE SUMMARY",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = KukapiZinc500
                            )
                            Spacer(modifier = Modifier.height(12.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Bag Subtotal", fontSize = 13.sp, color = KukapiZinc600)
                                Text("₹${subtotal.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = KukapiBlack)
                            }
                            if (discount > 0) {
                                Spacer(modifier = Modifier.height(6.dp))
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Text("Promo Discount ($appliedCoupon)", fontSize = 13.sp, color = KukapiEmerald)
                                    Text("-₹${discount.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = KukapiEmerald)
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Express Delivery", fontSize = 13.sp, color = KukapiZinc600)
                                Text(
                                    if (shipping == 0.0) "FREE" else "₹${shipping.toInt()}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (shipping == 0.0) KukapiEmerald else KukapiBlack
                                )
                            }
                            Divider(modifier = Modifier.padding(vertical = 12.dp), color = KukapiZinc200)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Total Amount", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                                    Text("Inclusive of all taxes", fontSize = 10.sp, color = KukapiZinc400)
                                }
                                Text(
                                    "₹${total.toInt()}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Black,
                                    color = KukapiBlack
                                )
                            }
                        }
                    }
                }

                item {
                    // Checkout Button
                    Button(
                        onClick = onCheckout,
                        colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text("Proceed to Checkout", fontWeight = FontWeight.Black, fontSize = 15.sp, color = KukapiWhite)
                            Spacer(modifier = Modifier.width(8.dp))
                            Icon(imageVector = Icons.Default.ArrowForward, contentDescription = null, tint = KukapiWhite, modifier = Modifier.size(18.dp))
                        }
                    }
                    Spacer(modifier = Modifier.height(24.dp))
                }
            }
        }
    }
}

@Composable
fun CartItemRow(
    item: CartItem,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
    onRemove: () -> Unit
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = KukapiWhite),
        shape = RoundedCornerShape(16.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp)
        ) {
            AsyncImage(
                model = item.product.imageUrl,
                contentDescription = item.product.title,
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(KukapiZinc100),
                contentScale = ContentScale.Crop
            )
            Spacer(modifier = Modifier.width(12.dp))
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top
                ) {
                    Text(
                        text = item.product.title,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        color = KukapiBlack,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(
                        onClick = onRemove,
                        modifier = Modifier.size(24.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Remove", tint = KukapiZinc400, modifier = Modifier.size(16.dp))
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = KukapiZinc100,
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = "Size: ${item.selectedSize}",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = KukapiZinc700,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        color = KukapiZinc100,
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = item.selectedColor,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = KukapiZinc700,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "₹${(item.price * item.quantity).toInt()}",
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp,
                        color = KukapiBlack
                    )
                    // Quantity adjuster
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(KukapiZinc100)
                    ) {
                        IconButton(
                            onClick = onDecrement,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Remove, contentDescription = "Decrease", modifier = Modifier.size(12.dp), tint = KukapiBlack)
                        }
                        Text(
                            text = "${item.quantity}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = KukapiBlack,
                            modifier = Modifier.padding(horizontal = 4.dp)
                        )
                        IconButton(
                            onClick = onIncrement,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Add, contentDescription = "Increase", modifier = Modifier.size(12.dp), tint = KukapiBlack)
                        }
                    }
                }
            }
        }
    }
}
