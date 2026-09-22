package com.kukapi.app.presentation.account

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForwardIos
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.CustomerOrder
import com.kukapi.app.presentation.admin.AdminConfigDialog
import com.kukapi.app.presentation.ai.AiStylistDialog
import com.kukapi.app.presentation.home.ProductViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountScreen(
    viewModel: ProductViewModel,
    onOpenWishlist: () -> Unit = {},
    onTrackOrder: (CustomerOrder) -> Unit = {},
    onOpenNotifications: () -> Unit = {}
) {
    val scrollState = rememberScrollState()
    val context = LocalContext.current
    val user by viewModel.currentUser.collectAsState()
    val orders by viewModel.orders.collectAsState()
    
    val currentUser = user
    val displayName = currentUser?.let { session ->
        listOf(session.firstName, session.lastName)
            .filter { name -> name.isNotBlank() }
            .joinToString(" ")
            .ifBlank { "Arjun Kapoor" }
    } ?: "Arjun Kapoor"

    var showAdminDialog by remember { mutableStateOf(false) }
    var showAiStylistDialog by remember { mutableStateOf(false) }

    if (showAdminDialog) {
        AdminConfigDialog(viewModel = viewModel, onDismiss = { showAdminDialog = false })
    }
    if (showAiStylistDialog) {
        AiStylistDialog(
            viewModel = viewModel,
            onDismiss = { showAiStylistDialog = false },
            onProductClick = { /* Handled */ }
        )
    }

    Scaffold(
        containerColor = KukapiZinc50,
        topBar = {
            TopAppBar(
                title = { Text("My Account", fontWeight = FontWeight.Bold) },
                actions = {
                    IconButton(onClick = onOpenNotifications) {
                        Icon(imageVector = Icons.Default.Notifications, contentDescription = "Notifications")
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = KukapiWhite)
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(scrollState)
        ) {
            // Profile Header
            Card(
                colors = CardDefaults.cardColors(containerColor = KukapiBlack),
                shape = RoundedCornerShape(bottomStart = 24.dp, bottomEnd = 24.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(24.dp)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(CircleShape)
                                .background(KukapiAmber),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Person,
                                contentDescription = null,
                                tint = KukapiBlack,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = displayName,
                                color = KukapiWhite,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Black
                            )
                            Text(
                                text = currentUser?.email ?: "vip.shopper@kukapi.com",
                                color = KukapiZinc400,
                                fontSize = 12.sp
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        QuickStatCard(title = "VIP Points", value = "${currentUser?.points ?: 0}", modifier = Modifier.weight(1f))
                        QuickStatCard(title = "Orders", value = "${orders.size}", modifier = Modifier.weight(1f))
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Active Orders Section
            if (orders.isNotEmpty()) {
                Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                    Text(
                        text = "RECENT ORDERS & TRACKING",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp,
                        color = KukapiZinc500
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    orders.forEach { order ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp)
                        ) {
                            Column(modifier = Modifier.padding(14.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text("Order #${order.orderNumber}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = KukapiBlack)
                                    Surface(
                                        color = KukapiEmerald.copy(alpha = 0.12f),
                                        shape = RoundedCornerShape(4.dp)
                                    ) {
                                        Text(
                                            text = order.status.uppercase(),
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = KukapiEmerald,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Spacer(modifier = Modifier.height(4.dp))
                                Text("₹${order.totalPrice.toInt()} · ${order.items.size} item(s) · Est: ${order.estimatedDelivery}", fontSize = 11.sp, color = KukapiZinc500)
                                Spacer(modifier = Modifier.height(8.dp))
                                Button(
                                    onClick = {
                                        viewModel.setTrackingOrder(order)
                                        onTrackOrder(order)
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                                    shape = RoundedCornerShape(8.dp),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(38.dp)
                                ) {
                                    Icon(imageVector = Icons.Default.LocalShipping, contentDescription = null, modifier = Modifier.size(14.dp), tint = KukapiWhite)
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Track Live Shipment", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = KukapiWhite)
                                }
                            }
                        }
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
            
            // Interactive Hub Menu
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Text(
                    text = "FEATURES & SERVICES",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp,
                    color = KukapiZinc500
                )
                Spacer(modifier = Modifier.height(8.dp))
                Card(
                    colors = CardDefaults.cardColors(containerColor = KukapiWhite),
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column {
                        AccountMenuItem(
                            icon = Icons.Default.AutoAwesome,
                            title = "AI Fashion Stylist",
                            subtitle = "Gemini-powered outfit suggestions & fit recommendations",
                            onClick = { showAiStylistDialog = true }
                        )
                        Divider(color = KukapiZinc100)
                        AccountMenuItem(
                            icon = Icons.Default.Tune,
                            title = "Store Configuration",
                            subtitle = "Manage banner announcement, shipping threshold & COD",
                            onClick = { showAdminDialog = true }
                        )
                        Divider(color = KukapiZinc100)
                        AccountMenuItem(
                            icon = Icons.Default.Favorite,
                            title = "Saved Wishlist",
                            subtitle = "View and manage your saved garments",
                            onClick = onOpenWishlist
                        )
                        Divider(color = KukapiZinc100)
                        AccountMenuItem(
                            icon = Icons.Default.HeadsetMic,
                            title = "VIP Concierge & WhatsApp Support",
                            subtitle = "Direct human assistance for size advice and order dispatch",
                            onClick = {
                                val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919820012345?text=Hi%20KUKAPI%20Team,%20I%20need%20assistance%20with%20my%20order"))
                                context.startActivity(browserIntent)
                            }
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(28.dp))
        }
    }
}

@Composable
fun QuickStatCard(title: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = KukapiWhite)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = value, fontSize = 16.sp, fontWeight = FontWeight.Black, color = KukapiBlack)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = title, fontSize = 11.sp, color = KukapiZinc500)
        }
    }
}

@Composable
fun AccountMenuItem(
    icon: ImageVector,
    title: String,
    subtitle: String,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(36.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(KukapiZinc100),
            contentAlignment = Alignment.Center
        ) {
            Icon(imageVector = icon, contentDescription = null, tint = KukapiBlack, modifier = Modifier.size(18.dp))
        }
        Spacer(modifier = Modifier.width(12.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = KukapiBlack)
            Text(subtitle, fontSize = 11.sp, color = KukapiZinc500, lineHeight = 14.sp)
        }
        Icon(imageVector = Icons.AutoMirrored.Filled.ArrowForwardIos, contentDescription = null, tint = KukapiZinc400, modifier = Modifier.size(14.dp))
    }
}
