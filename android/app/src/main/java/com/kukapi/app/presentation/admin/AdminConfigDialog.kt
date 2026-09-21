package com.kukapi.app.presentation.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.AdminConfig
import com.kukapi.app.presentation.home.ProductViewModel

@Composable
fun AdminConfigDialog(
    viewModel: ProductViewModel,
    onDismiss: () -> Unit
) {
    val currentConfig by viewModel.adminConfig.collectAsState()

    var announcement by remember { mutableStateOf(currentConfig.announcement) }
    var freeShipping by remember { mutableStateOf(currentConfig.freeShippingThreshold.toInt().toString()) }
    var shippingFee by remember { mutableStateOf(currentConfig.shippingFee.toInt().toString()) }
    var codAdvance by remember { mutableStateOf(currentConfig.codAdvance.toInt().toString()) }
    var codEnabled by remember { mutableStateOf(currentConfig.isCodEnabled) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = KukapiWhite),
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .wrapContentHeight()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(imageVector = Icons.Default.Tune, contentDescription = null, tint = KukapiBlack)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("STORE SETTINGS", fontWeight = FontWeight.Black, fontSize = 15.sp, letterSpacing = 1.sp, color = KukapiBlack)
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = KukapiZinc600)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                OutlinedTextField(
                    value = announcement,
                    onValueChange = { announcement = it },
                    label = { Text("Announcement Ticker Banner", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                )

                Spacer(modifier = Modifier.height(10.dp))

                Row(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = freeShipping,
                        onValueChange = { freeShipping = it },
                        label = { Text("Free Ship Min (₹)", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    OutlinedTextField(
                        value = shippingFee,
                        onValueChange = { shippingFee = it },
                        label = { Text("Standard Ship (₹)", fontSize = 11.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(10.dp),
                        singleLine = true
                    )
                }

                Spacer(modifier = Modifier.height(10.dp))

                OutlinedTextField(
                    value = codAdvance,
                    onValueChange = { codAdvance = it },
                    label = { Text("Partial COD Advance Fee (₹)", fontSize = 11.sp) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Enable Cash on Delivery", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                        Text("Allow customers to pay upon delivery", fontSize = 11.sp, color = KukapiZinc500)
                    }
                    Switch(
                        checked = codEnabled,
                        onCheckedChange = { codEnabled = it },
                        colors = SwitchDefaults.colors(checkedThumbColor = KukapiBlack, checkedTrackColor = KukapiZinc300)
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                Button(
                    onClick = {
                        val newConfig = AdminConfig(
                            announcement = announcement,
                            freeShippingThreshold = freeShipping.toDoubleOrNull() ?: 999.0,
                            shippingFee = shippingFee.toDoubleOrNull() ?: 99.0,
                            codAdvance = codAdvance.toDoubleOrNull() ?: 199.0,
                            isCodEnabled = codEnabled
                        )
                        viewModel.updateAdminConfig(newConfig)
                        onDismiss()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = KukapiBlack),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                ) {
                    Text("Save Configuration", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = KukapiWhite)
                }
            }
        }
    }
}
