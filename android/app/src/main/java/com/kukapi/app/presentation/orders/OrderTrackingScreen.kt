package com.kukapi.app.presentation.orders

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.presentation.home.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrderTrackingScreen(
    viewModel: ProductViewModel,
    onBack: () -> Unit = {}
) {
    val currentOrder by viewModel.currentTrackingOrder.collectAsState()
    val context = LocalContext.current

    val order = currentOrder ?: viewModel.orders.value.firstOrNull()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "LIVE SHIPMENT TRACKING",
                            fontWeight = FontWeight.Black,
                            fontSize = 15.sp,
                            letterSpacing = 2.sp,
                            color = KukapiBlack
                        )
                        Text(
                            text = "Order #${order?.orderNumber ?: "KUK-98214"}",
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
                    IconButton(onClick = {
                        val shareIntent = Intent().apply {
                            action = Intent.ACTION_SEND
                            putExtra(Intent.EXTRA_TEXT, "Tracking KUKAPI Order #${order?.orderNumber}: Carrier ${order?.carrier ?: "Delhivery Express"} AWB: ${order?.trackingNumber ?: "DLV-98741203"}")
                            type = "text/plain"
                        }
                        context.startActivity(Intent.createChooser(shareIntent, "Share Tracking"))
                    }) {
                        Icon(imageVector = Icons.Default.Share, contentDescription = "Share", tint = KukapiBlack)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KukapiWhite)
            )
        }
    ) { paddingValues ->
        if (order == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Text("No active order found", color = KukapiZinc500)
            }
        } else {
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
                    // Order Success Status Card
                    Card(
                        colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(
                            modifier = Modifier.padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(RoundedCornerShape(27.dp))
                                    .background(KukapiEmerald.copy(alpha = 0.12f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.CheckCircle,
                                    contentDescription = null,
                                    tint = KukapiEmerald,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            Surface(
                                color = KukapiEmerald.copy(alpha = 0.12f),
                                shape = RoundedCornerShape(20.dp)
                            ) {
                                Text(
                                    text = order.financialStatus,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Black,
                                    color = KukapiEmerald,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Order ${order.orderNumber}",
                                fontWeight = FontWeight.Black,
                                fontSize = 18.sp,
                                color = KukapiBlack
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Estimated Delivery: ${order.estimatedDelivery}",
                                fontSize = 12.sp,
                                color = KukapiZinc600,
                                fontWeight = FontWeight.Medium
                            )
                            Spacer(modifier = Modifier.height(14.dp))
                            Surface(
                                color = KukapiZinc100,
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(12.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text("Carrier & Waybill", fontSize = 10.sp, color = KukapiZinc500, fontWeight = FontWeight.SemiBold)
                                        Text("${order.carrier} (${order.trackingNumber})", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                                    }
                                    Surface(
                                        color = KukapiEmerald.copy(alpha = 0.15f),
                                        shape = RoundedCornerShape(20.dp)
                                    ) {
                                        Text("● Live", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = KukapiEmerald, modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp))
                                    }
                                }
                            }
                        }
                    }
                }

                item {
                    // Milestone Timeline Card
                    Card(
                        colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(20.dp)) {
                            Text(
                                text = "SHIPMENT MILESTONES",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp,
                                color = KukapiBlack
                            )
                            Spacer(modifier = Modifier.height(16.dp))

                            MilestoneStep(
                                title = "Order Placed",
                                subtitle = "Confirmed & Payment verified on Shopify",
                                isCompleted = true,
                                isCurrent = false,
                                isLast = false
                            )
                            MilestoneStep(
                                title = "Processing at Hub",
                                subtitle = "Surat Central Garment Hub · Barcode scanned",
                                isCompleted = true,
                                isCurrent = false,
                                isLast = false
                            )
                            MilestoneStep(
                                title = "Dispatched via Delhivery",
                                subtitle = "Air Cargo in transit to destination city",
                                isCompleted = true,
                                isCurrent = true,
                                isLast = false
                            )
                            MilestoneStep(
                                title = "Out for Delivery",
                                subtitle = "Courier assigned for final doorstep drop",
                                isCompleted = false,
                                isCurrent = false,
                                isLast = false
                            )
                            MilestoneStep(
                                title = "Delivered",
                                subtitle = "Package handed over with OTP verification",
                                isCompleted = false,
                                isCurrent = false,
                                isLast = true
                            )
                        }
                    }
                }

                item {
                    // Order Items Card
                    Card(
                        colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                        shape = RoundedCornerShape(20.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "PACKAGE ITEMS (${order.items.size})",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp,
                                color = KukapiZinc500
                            )
                            Spacer(modifier = Modifier.height(10.dp))
                            order.items.forEach { item ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 6.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(item.title, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                                        Text("Qty: ${item.quantity} · ${item.variantTitle ?: "Standard"}", fontSize = 11.sp, color = KukapiZinc500)
                                    }
                                    Text("₹${(item.price * item.quantity).toInt()}", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                                }
                            }
                            Divider(modifier = Modifier.padding(vertical = 10.dp), color = KukapiZinc200)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Total Paid", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                                Text("₹${order.totalPrice.toInt()}", fontSize = 15.sp, fontWeight = FontWeight.Black, color = KukapiBlack)
                            }
                        }
                    }
                    Spacer(modifier = Modifier.height(28.dp))
                }
            }
        }
    }
}

@Composable
fun MilestoneStep(
    title: String,
    subtitle: String,
    isCompleted: Boolean,
    isCurrent: Boolean,
    isLast: Boolean
) {
    Row(modifier = Modifier.fillMaxWidth()) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(
                        if (isCompleted) KukapiEmerald else KukapiZinc200
                    ),
                contentAlignment = Alignment.Center
            ) {
                if (isCompleted) {
                    Icon(imageVector = Icons.Default.Check, contentDescription = null, tint = KukapiWhite, modifier = Modifier.size(12.dp))
                }
            }
            if (!isLast) {
                Box(
                    modifier = Modifier
                        .width(2.dp)
                        .height(36.dp)
                        .background(if (isCompleted) KukapiEmerald else KukapiZinc200)
                )
            }
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.padding(bottom = if (isLast) 0.dp else 18.dp)) {
            Text(
                text = title,
                fontSize = 13.sp,
                fontWeight = if (isCurrent || isCompleted) FontWeight.Bold else FontWeight.Medium,
                color = if (isCompleted) KukapiBlack else KukapiZinc400
            )
            Text(
                text = subtitle,
                fontSize = 11.sp,
                color = if (isCompleted) KukapiZinc600 else KukapiZinc400,
                lineHeight = 14.sp
            )
        }
    }
}
