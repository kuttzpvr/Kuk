package com.kukapi.app.presentation.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.Product
import com.kukapi.app.presentation.home.ProductViewModel

@Composable
fun AiStylistDialog(
    viewModel: ProductViewModel,
    onDismiss: () -> Unit,
    onProductClick: (Product) -> Unit
) {
    var selectedPrompt by remember { mutableStateOf("What matches 240 GSM tees?") }
    val products = viewModel.getAllProducts()

    val promptPresets = listOf(
        "What matches 240 GSM tees?",
        "Best oversized fit for tall build",
        "Ethnic silk styling for evening",
        "All-black streetwear aesthetic",
        "Summer breathable luxury"
    )

    val responseMap = mapOf(
        "What matches 240 GSM tees?" to "Pair 240 GSM Heavyweight Tees with wide-leg cargo pants or structured denim. The heavy drape creates an architectural silhouette that demands relaxed bottom cuts.",
        "Best oversized fit for tall build?" to "For heights 5'11\" and above, size L or XL gives the intended boxy streetwear drop-shoulder aesthetic without riding up when moving.",
        "Ethnic silk styling for evening" to "Our Chanderi silk kurtis blend beautifully with understated linen trousers or cropped palazzos, finished with minimal leather slides.",
        "All-black streetwear aesthetic" to "Combine the Riders Oversized Tee in Jet Black with dark tactical trousers and chunky monochrome sneakers for a timeless dark minimalism.",
        "Summer breathable luxury" to "Combed compact 240 GSM cotton absorbs moisture and breathes naturally despite its thick feel, keeping you cool under direct sunlight."
    )

    val currentAdvice = responseMap[selectedPrompt] ?: "KUKAPI garments are engineered for effortless styling with premium heavyweight drapes and artisanal finishes."

    val recommendedProducts = products.take(4)

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = KukapiWhite),
            modifier = Modifier
                .fillMaxWidth(0.92f)
                .fillMaxHeight(0.85f)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(18.dp))
                                .background(KukapiBlack),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(imageVector = Icons.Default.AutoAwesome, contentDescription = null, tint = KukapiAmber, modifier = Modifier.size(20.dp))
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Column {
                            Text("AI FASHION STYLIST", fontWeight = FontWeight.Black, fontSize = 14.sp, letterSpacing = 1.sp, color = KukapiBlack)
                            Text("Gemini-powered garment matching", fontSize = 10.sp, color = KukapiZinc500)
                        }
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = KukapiZinc600)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Prompt Chips Carousel
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(promptPresets) { prompt ->
                        Surface(
                            color = if (selectedPrompt == prompt) KukapiBlack else KukapiZinc100,
                            shape = RoundedCornerShape(20.dp),
                            modifier = Modifier.clickable { selectedPrompt = prompt }
                        ) {
                            Text(
                                text = prompt,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (selectedPrompt == prompt) KukapiWhite else KukapiZinc800,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Advice Bubble
                Surface(
                    color = KukapiZinc50,
                    shape = RoundedCornerShape(16.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(14.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(imageVector = Icons.Default.Lightbulb, contentDescription = null, tint = KukapiAmber, modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(6.dp))
                            Text("Stylist Recommendation", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = KukapiBlack)
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = currentAdvice,
                            fontSize = 12.sp,
                            color = KukapiZinc700,
                            lineHeight = 17.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))
                Text("RECOMMENDED SILHOUETTES", fontSize = 11.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp, color = KukapiZinc500)
                Spacer(modifier = Modifier.height(8.dp))

                // Recommended Product List
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(recommendedProducts) { prod ->
                        Card(
                            colors = CardDefaults.cardColors(containerColor = KukapiZinc50),
                            shape = RoundedCornerShape(12.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    onDismiss()
                                    onProductClick(prod)
                                }
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                AsyncImage(
                                    model = prod.imageUrl,
                                    contentDescription = prod.title,
                                    modifier = Modifier
                                        .size(50.dp)
                                        .clip(RoundedCornerShape(8.dp)),
                                    contentScale = ContentScale.Crop
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(prod.title, fontWeight = FontWeight.Bold, fontSize = 12.sp, color = KukapiBlack, maxLines = 1)
                                    Text("₹${prod.price.toInt()} · ${prod.gsm}", fontSize = 11.sp, color = KukapiZinc500)
                                }
                                Icon(imageVector = Icons.Default.ChevronRight, contentDescription = null, tint = KukapiZinc400)
                            }
                        }
                    }
                }
            }
        }
    }
}
