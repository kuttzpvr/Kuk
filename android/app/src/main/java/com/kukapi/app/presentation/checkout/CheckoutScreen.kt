package com.kukapi.app.presentation.checkout

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.kukapi.app.domain.model.CustomerOrder
import com.kukapi.app.domain.model.ShippingAddress
import com.kukapi.app.presentation.home.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CheckoutScreen(
    viewModel: ProductViewModel,
    onBack: () -> Unit = {},
    onOrderPlaced: (CustomerOrder) -> Unit = {}
) {
    val cartItems by viewModel.cartItems.collectAsState()
    val savedAddresses by viewModel.savedAddresses.collectAsState()
    val adminConfig by viewModel.adminConfig.collectAsState()

    var selectedAddress by remember {
        mutableStateOf(savedAddresses.firstOrNull { it.isDefault } ?: savedAddresses.firstOrNull())
    }

    var name by remember { mutableStateOf(selectedAddress?.name ?: "Arjun Kapoor") }
    var phone by remember { mutableStateOf(selectedAddress?.phone ?: "+91 98200 12345") }
    var email by remember { mutableStateOf(selectedAddress?.email ?: "vip.shopper@kukapi.com") }
    var line1 by remember { mutableStateOf(selectedAddress?.addressLine1 ?: "Flat 402, Signature Towers") }
    var city by remember { mutableStateOf(selectedAddress?.city ?: "Mumbai") }
    var state by remember { mutableStateOf(selectedAddress?.state ?: "Maharashtra") }
    var pincode by remember { mutableStateOf(selectedAddress?.pincode ?: "400050") }

    var selectedPaymentMethod by remember { mutableStateOf("cod_advance") } // "cod_advance", "online", "cod"
    var isPlacingOrder by remember { mutableStateOf(false) }

    val subtotal = viewModel.getCartSubtotal()
    val discount = viewModel.getDiscountAmount()
    val shipping = viewModel.getShippingFee()
    val grandTotal = viewModel.getGrandTotal()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "SECURE CHECKOUT",
                            fontWeight = FontWeight.Black,
                            fontSize = 16.sp,
                            letterSpacing = 2.sp,
                            color = KukapiBlack
                        )
                        Text(
                            text = "Shopify Storefront Verified",
                            fontSize = 11.sp,
                            color = KukapiEmerald,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(imageVector = Icons.Default.ArrowBack, contentDescription = "Back", tint = KukapiBlack)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KukapiWhite)
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(KukapiZinc50)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                // Section 1: Delivery Address Form
                Card(
                    colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.LocationOn, contentDescription = null, tint = KukapiBlack, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("1. DELIVERY ADDRESS", fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, color = KukapiBlack)
                        }
                        Spacer(modifier = Modifier.height(12.dp))
                        OutlinedTextField(
                            value = name,
                            onValueChange = { name = it },
                            label = { Text("Full Name", fontSize = 11.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth()) {
                            OutlinedTextField(
                                value = phone,
                                onValueChange = { phone = it },
                                label = { Text("Mobile Number", fontSize = 11.sp) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            OutlinedTextField(
                                value = pincode,
                                onValueChange = { pincode = it },
                                label = { Text("Pincode", fontSize = 11.sp) },
                                modifier = Modifier.weight(0.8f),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        OutlinedTextField(
                            value = line1,
                            onValueChange = { line1 = it },
                            label = { Text("House / Flat No., Building, Street", fontSize = 11.sp) },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(10.dp),
                            singleLine = true
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Row(modifier = Modifier.fillMaxWidth()) {
                            OutlinedTextField(
                                value = city,
                                onValueChange = { city = it },
                                label = { Text("City", fontSize = 11.sp) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            OutlinedTextField(
                                value = state,
                                onValueChange = { state = it },
                                label = { Text("State", fontSize = 11.sp) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(10.dp),
                                singleLine = true
                            )
                        }
                    }
                }
            }

            item {
                // Section 2: Payment Options Card
                Card(
                    colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Payment, contentDescription = null, tint = KukapiBlack, modifier = Modifier.size(18.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("2. PAYMENT METHOD", fontSize = 12.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, color = KukapiBlack)
                        }
                        Spacer(modifier = Modifier.height(12.dp))

                        // Option A: COD with ₹199 Advance Confirmation
                        PaymentOptionRow(
                            title = "Partial COD (Advance ₹199)",
                            subtitle = "Pay ₹199 online to confirm + Balance ₹${(grandTotal - 199).coerceAtLeast(0.0).toInt()} on delivery",
                            badge = "MOST POPULAR",
                            badgeColor = KukapiEmerald,
                            isSelected = selectedPaymentMethod == "cod_advance",
                            onClick = { selectedPaymentMethod = "cod_advance" }
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        // Option B: 100% Online UPI / Card / NetBanking
                        PaymentOptionRow(
                            title = "Full Online Payment",
                            subtitle = "Instant UPI, Credit/Debit Card, NetBanking via Shopify Gateway",
                            badge = "EXTRA ₹50 OFF",
                            badgeColor = KukapiAmber,
                            isSelected = selectedPaymentMethod == "online",
                            onClick = { selectedPaymentMethod = "online" }
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        // Option C: Standard Cash on Delivery
                        PaymentOptionRow(
                            title = "Standard Cash on Delivery",
                            subtitle = "Pay 100% cash upon parcel arrival at doorstep",
                            badge = "+₹${adminConfig.codFee.toInt()} COD Fee",
                            badgeColor = KukapiZinc600,
                            isSelected = selectedPaymentMethod == "cod",
                            onClick = { selectedPaymentMethod = "cod" }
                        )
                    }
                }
            }

            item {
                // Order Summary Card
                Card(
                    colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "ORDER SUMMARY",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp,
                            color = KukapiZinc500
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Items Total (${cartItems.sumOf { it.quantity }})", fontSize = 13.sp, color = KukapiZinc600)
                            Text("₹${subtotal.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = KukapiBlack)
                        }
                        if (discount > 0) {
                            Spacer(modifier = Modifier.height(6.dp))
                            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                Text("Discount", fontSize = 13.sp, color = KukapiEmerald)
                                Text("-₹${discount.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = KukapiEmerald)
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("Delivery Fee", fontSize = 13.sp, color = KukapiZinc600)
                            Text(if (shipping == 0.0) "FREE" else "₹${shipping.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = if (shipping == 0.0) KukapiEmerald else KukapiBlack)
                        }
                        Divider(modifier = Modifier.padding(vertical = 10.dp), color = KukapiZinc200)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Total Payable", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                            Text("₹${grandTotal.toInt()}", fontSize = 18.sp, fontWeight = FontWeight.Black, color = KukapiBlack)
                        }
                    }
                }
            }

            item {
                Button(
                    onClick = {
                        isPlacingOrder = true
                        val addr = ShippingAddress(
                            name = name,
                            email = email,
                            phone = phone,
                            addressLine1 = line1,
                            city = city,
                            state = state,
                            pincode = pincode,
                            isDefault = true
                        )
                        val order = viewModel.createOrder(selectedPaymentMethod, addr)
                        onOrderPlaced(order)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                    shape = RoundedCornerShape(14.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    enabled = !isPlacingOrder && cartItems.isNotEmpty()
                ) {
                    if (isPlacingOrder) {
                        CircularProgressIndicator(color = KukapiWhite, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Lock, contentDescription = null, tint = KukapiWhite, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Place Order · ₹${grandTotal.toInt()}", fontWeight = FontWeight.Black, fontSize = 15.sp, color = KukapiWhite)
                        }
                    }
                }
                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

@Composable
fun PaymentOptionRow(
    title: String,
    subtitle: String,
    badge: String,
    badgeColor: Color,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(if (isSelected) KukapiZinc50 else KukapiWhite)
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) KukapiBlack else KukapiZinc200,
                shape = RoundedCornerShape(12.dp)
            )
            .clickable(onClick = onClick)
            .padding(12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            RadioButton(
                selected = isSelected,
                onClick = onClick,
                colors = RadioButtonDefaults.colors(selectedColor = KukapiBlack)
            )
            Spacer(modifier = Modifier.width(8.dp))
            Column(modifier = Modifier.weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                    Spacer(modifier = Modifier.width(6.dp))
                    Surface(
                        color = badgeColor.copy(alpha = 0.12f),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = badge,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            color = badgeColor,
                            modifier = Modifier.padding(horizontal = 5.dp, vertical = 1.dp)
                        )
                    }
                }
                Spacer(modifier = Modifier.height(2.dp))
                Text(text = subtitle, fontSize = 11.sp, color = KukapiZinc500, lineHeight = 14.sp)
            }
        }
    }
}
