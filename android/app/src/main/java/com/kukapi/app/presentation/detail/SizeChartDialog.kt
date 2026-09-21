package com.kukapi.app.presentation.detail

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.kukapi.app.core.designsystem.*

@Composable
fun SizeChartDialog(
    onDismiss: () -> Unit
) {
    var unit by remember { mutableStateOf("inches") } // "inches" or "cm"

    val sizeDataInches = listOf(
        listOf("S", "42\"", "28\"", "19.5\""),
        listOf("M", "44\"", "29\"", "20.5\""),
        listOf("L", "46\"", "30\"", "21.5\""),
        listOf("XL", "48\"", "31\"", "22.5\""),
        listOf("XXL", "50\"", "32\"", "23.5\"")
    )

    val sizeDataCm = listOf(
        listOf("S", "107 cm", "71 cm", "49.5 cm"),
        listOf("M", "112 cm", "74 cm", "52.0 cm"),
        listOf("L", "117 cm", "76 cm", "54.5 cm"),
        listOf("XL", "122 cm", "79 cm", "57.0 cm"),
        listOf("XXL", "127 cm", "81 cm", "59.5 cm")
    )

    val currentData = if (unit == "inches") sizeDataInches else sizeDataCm

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
                    Column {
                        Text("SIZE & MEASUREMENTS", fontWeight = FontWeight.Black, fontSize = 15.sp, letterSpacing = 1.sp, color = KukapiBlack)
                        Text("Heavyweight Oversized Streetwear Cut", fontSize = 11.sp, color = KukapiZinc500)
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = KukapiZinc600)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Unit Switcher (Inches / CM)
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(KukapiZinc100)
                        .padding(3.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (unit == "inches") KukapiBlack else KukapiZinc100)
                            .clickable { unit = "inches" }
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text("Inches", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (unit == "inches") KukapiWhite else KukapiZinc700)
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (unit == "cm") KukapiBlack else KukapiZinc100)
                            .clickable { unit = "cm" }
                            .padding(horizontal = 14.dp, vertical = 6.dp)
                    ) {
                        Text("Centimeters", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (unit == "cm") KukapiWhite else KukapiZinc700)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Table Header
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(KukapiZinc100)
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("SIZE", fontSize = 11.sp, fontWeight = FontWeight.Black, color = KukapiZinc700, modifier = Modifier.weight(1f))
                    Text("CHEST", fontSize = 11.sp, fontWeight = FontWeight.Black, color = KukapiZinc700, modifier = Modifier.weight(1f))
                    Text("LENGTH", fontSize = 11.sp, fontWeight = FontWeight.Black, color = KukapiZinc700, modifier = Modifier.weight(1f))
                    Text("SHOULDER", fontSize = 11.sp, fontWeight = FontWeight.Black, color = KukapiZinc700, modifier = Modifier.weight(1f))
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Table Rows
                currentData.forEachIndexed { idx, row ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(row[0], fontSize = 12.sp, fontWeight = FontWeight.Black, color = KukapiBlack, modifier = Modifier.weight(1f))
                        Text(row[1], fontSize = 12.sp, fontWeight = FontWeight.Medium, color = KukapiZinc800, modifier = Modifier.weight(1f))
                        Text(row[2], fontSize = 12.sp, fontWeight = FontWeight.Medium, color = KukapiZinc800, modifier = Modifier.weight(1f))
                        Text(row[3], fontSize = 12.sp, fontWeight = FontWeight.Medium, color = KukapiZinc800, modifier = Modifier.weight(1f))
                    }
                    if (idx < currentData.size - 1) {
                        Divider(color = KukapiZinc100)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                Surface(
                    color = KukapiZinc50,
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "💡 Pro Tip: Our garments feature an intentional boxy drop-shoulder streetwear fit. For a regular snug fit, order one size down.",
                        fontSize = 11.sp,
                        color = KukapiZinc600,
                        modifier = Modifier.padding(12.dp),
                        lineHeight = 15.sp
                    )
                }
            }
        }
    }
}
