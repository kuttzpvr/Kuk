import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Folder,
  FileCode,
  Download,
  Smartphone,
  Layers,
  Terminal,
  CheckCircle2,
  ExternalLink,
  ShoppingBag,
  Home,
  Search,
  Heart,
  User,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';

export const AndroidExportModal: React.FC = () => {
  const { isAndroidModalOpen, setIsAndroidModalOpen, showToast, products } = useShop();
  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'guide'>('preview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>('app/build.gradle.kts');

  // Interactive Compose Preview State
  const [composeNavTab, setComposeNavTab] = useState<'home' | 'shop' | 'search' | 'wishlist' | 'account'>('home');
  const [composeCategory, setComposeCategory] = useState<string>('All');

  if (!isAndroidModalOpen) return null;

  const androidFiles: Record<string, { label: string; code: string; desc: string }> = {
    'app/build.gradle.kts': {
      label: 'app/build.gradle.kts',
      desc: 'Android App Module Build Configuration & Compose Dependencies',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.kukapi.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.kukapi.app"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"

        // Public Configuration for Shopify Storefront
        buildConfigField("String", "SHOPIFY_STORE_DOMAIN", "\\"kukapi.myshopify.com\\"")
        buildConfigField("String", "SHOPIFY_STOREFRONT_TOKEN", "\\"c6a4d33e5fc2cd9775bd7c11bea98f9d\\"")
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.11"
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    
    // Security & DataStore
    implementation(libs.androidx.security.crypto)
    implementation(libs.androidx.datastore.preferences)

    // Networking (Ktor HTTP & JSON)
    implementation(libs.ktor.client.core)
    implementation(libs.ktor.client.okhttp)
    implementation(libs.ktor.client.content.negotiation)
    implementation(libs.ktor.serialization.kotlinx.json)

    // Image Pipeline
    implementation(libs.coil.compose)
}`,
    },
    'MainActivity.kt': {
      label: 'MainActivity.kt',
      desc: 'Native Jetpack Compose App Entry Point & Activity',
      code: `package com.kukapi.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.kukapi.app.core.designsystem.KukapiTheme
import com.kukapi.app.presentation.navigation.KukapiNavGraph

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KukapiTheme {
                Surface(modifier = Modifier.fillMaxSize()) {
                    KukapiNavGraph()
                }
            }
        }
    }
}`,
    },
    'ShopifyClient.kt': {
      label: 'ShopifyClient.kt',
      desc: 'Shopify Storefront GraphQL Client using Ktor Coroutines',
      code: `package com.kukapi.app.core.network

import com.kukapi.app.domain.model.Product
import io.ktor.client.HttpClient
import io.ktor.client.engine.okhttp.OkHttp
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation
import io.ktor.client.request.header
import io.ktor.client.request.post
import io.ktor.client.request.setBody
import io.ktor.client.statement.bodyAsText
import io.ktor.http.ContentType
import io.ktor.http.contentType
import io.ktor.serialization.kotlinx.json.json
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.doubleOrNull

object ShopifyClient {
    private const val STORE_DOMAIN = "kukapi.myshopify.com"
    private const val STOREFRONT_TOKEN = "c6a4d33e5fc2cd9775bd7c11bea98f9d"
    private const val GRAPHQL_ENDPOINT = "https://$STORE_DOMAIN/api/2024-01/graphql.json"

    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val httpClient = HttpClient(OkHttp) {
        install(ContentNegotiation) { json(json) }
    }

    suspend fun fetchLiveProducts(): Result<List<Product>> = withContext(Dispatchers.IO) {
        try {
            val query = """
                query GetProducts {
                  products(first: 30) {
                    edges {
                      node {
                        id
                        title
                        description
                        productType
                        featuredImage { url }
                        priceRange { minVariantPrice { amount } }
                        compareAtPriceRange { maxVariantPrice { amount } }
                      }
                    }
                  }
                }
            """.trimIndent()

            val response = httpClient.post(GRAPHQL_ENDPOINT) {
                contentType(ContentType.Application.Json)
                header("X-Shopify-Storefront-Access-Token", STOREFRONT_TOKEN)
                setBody("""{"query": \${Json.encodeToString(kotlinx.serialization.serializer(), query)}}""")
            }

            val parsed = json.parseToJsonElement(response.bodyAsText()).jsonObject
            val edges = parsed["data"]?.jsonObject?.get("products")?.jsonObject?.get("edges")?.jsonArray ?: emptyList()

            val products = edges.mapNotNull { edge ->
                val node = edge.jsonObject["node"]?.jsonObject ?: return@mapNotNull null
                Product(
                    id = node["id"]?.jsonPrimitive?.content ?: "",
                    title = node["title"]?.jsonPrimitive?.content ?: "KUKAPI Garment",
                    description = node["description"]?.jsonPrimitive?.content ?: "",
                    price = node["priceRange"]?.jsonObject?.get("minVariantPrice")?.jsonObject?.get("amount")?.jsonPrimitive?.content?.toDoubleOrNull() ?: 799.0,
                    compareAtPrice = (node["priceRange"]?.jsonObject?.get("minVariantPrice")?.jsonObject?.get("amount")?.jsonPrimitive?.content?.toDoubleOrNull() ?: 799.0) * 1.35,
                    imageUrl = node["featuredImage"]?.jsonObject?.get("url")?.jsonPrimitive?.content ?: "",
                    category = node["productType"]?.jsonPrimitive?.content ?: "Apparel"
                )
            }
            Result.success(products)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}`,
    },
    'HomeScreen.kt': {
      label: 'HomeScreen.kt',
      desc: 'Jetpack Compose Home Screen with Material 3 and AsyncImage',
      code: `package com.kukapi.app.presentation.home

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.kukapi.app.core.designsystem.*
import com.kukapi.app.domain.model.Product

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    products: List<Product>,
    onProductClick: (Product) -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text("KUKAPI", fontWeight = FontWeight.ExtraBold, letterSpacing = 3.sp)
                }
            )
        }
    ) { padding ->
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            modifier = Modifier.padding(padding),
            contentPadding = PaddingValues(12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(products) { product ->
                Card(
                    onClick = { onProductClick(product) },
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column {
                        AsyncImage(
                            model = product.imageUrl,
                            contentDescription = product.title,
                            modifier = Modifier.fillMaxWidth().height(180.dp),
                            contentScale = ContentScale.Crop
                        )
                        Text(
                            text = product.title,
                            modifier = Modifier.padding(8.dp),
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}`,
    },
    'Theme.kt': {
      label: 'Theme.kt',
      desc: 'Jetpack Compose Material 3 Theme System for KUKAPI Luxury Styling',
      code: `package com.kukapi.app.core.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val KukapiBlack = Color(0xFF09090B)
val KukapiZinc900 = Color(0xFF18181B)
val KukapiZinc800 = Color(0xFF27272A)
val KukapiZinc500 = Color(0xFF71717A)
val KukapiZinc50 = Color(0xFFFAFAFA)
val KukapiWhite = Color(0xFFFFFFFF)
val KukapiAmber = Color(0xFFF59E0B)

private val LightColorScheme = lightColorScheme(
    primary = KukapiBlack,
    onPrimary = KukapiWhite,
    background = KukapiZinc50,
    onBackground = KukapiZinc900,
    surface = KukapiWhite,
    onSurface = KukapiZinc900
)

@Composable
fun KukapiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}`,
    },
    'AndroidManifest.xml': {
      label: 'AndroidManifest.xml',
      desc: 'Android Manifest with Permissions & Deep Linking',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:name=".KukapiApplication"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="KUKAPI"
        android:theme="@style/Theme.KUKAPI">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.KUKAPI">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>

</manifest>`,
    },
  };

  const handleCopyCode = (key: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    showToast('Code copied to clipboard!', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl text-zinc-100">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight text-white">
                  KUKAPI Native Android App
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Kotlin + Jetpack Compose
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Shopify Storefront GraphQL Backend · Ready for Android Studio & Google Play
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs & Download Button */}
            <a
              href="/kukapi-android-project.zip"
              download="kukapi-android-project.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/40"
              title="Download Android Studio Project ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </a>

            <div className="flex p-1 bg-zinc-900 rounded-xl border border-zinc-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'preview'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Emulator Preview
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'code'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Kotlin Source
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'guide'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                Build & Run APK
              </button>
            </div>

            <button
              onClick={() => setIsAndroidModalOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* TAB 1: LIVE INTERACTIVE ANDROID EMULATOR PREVIEW */}
          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 sm:p-8 bg-zinc-900/30 overflow-y-auto gap-8">
              {/* Android Phone Device Frame Mockup */}
              <div className="relative w-[340px] h-[680px] bg-zinc-950 rounded-[48px] p-3 shadow-2xl border-[6px] border-zinc-700 ring-1 ring-white/10 flex flex-col select-none">
                {/* Android Punch Hole Camera Notch */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-black rounded-full z-30 ring-1 ring-zinc-800 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />
                </div>

                {/* Inner Screen Canvas */}
                <div className="w-full h-full bg-zinc-50 rounded-[38px] overflow-hidden flex flex-col text-zinc-900 relative">
                  {/* Android Status Bar */}
                  <div className="h-7 bg-white flex items-center justify-between px-6 pt-1 text-[11px] font-semibold text-zinc-800 z-20">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span>5G</span>
                      <div className="w-4 h-2 border border-zinc-800 rounded-sm p-0.5 flex items-center">
                        <div className="w-full h-full bg-zinc-800 rounded-xs" />
                      </div>
                    </div>
                  </div>

                  {/* Android TopAppBar (Jetpack Compose Material 3) */}
                  <div className="bg-white border-b border-zinc-200/80 px-4 py-2 flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-lg tracking-[0.25em] text-zinc-950">
                        KUKAPI
                      </span>
                      <span className="block text-[8px] tracking-widest text-zinc-400 font-bold uppercase -mt-0.5">
                        Android Native Compose
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-600">LIVE</span>
                    </div>
                  </div>

                  {/* Compose Body Content */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {/* Hero Banner Card */}
                    <div className="bg-zinc-950 text-white rounded-2xl p-4 relative overflow-hidden shadow-sm">
                      <div className="relative z-10">
                        <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
                          Jetpack Compose UI
                        </span>
                        <h3 className="text-xl font-black tracking-tight mt-0.5">
                          FLAT 40% OFF
                        </h3>
                        <p className="text-[11px] text-zinc-400 mt-1">
                          Connected to kukapi.myshopify.com
                        </p>
                      </div>
                    </div>

                    {/* Category Scroll Chips */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                      {['All', 'Oversized', 'Acid Wash', 'Kurtis'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setComposeCategory(cat)}
                          className={`px-3 py-1 rounded-full whitespace-nowrap text-xs font-semibold transition-all ${
                            composeCategory === cat
                              ? 'bg-zinc-950 text-white shadow-sm'
                              : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Section Header */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-extrabold tracking-wider text-zinc-900 uppercase">
                        TRENDING DROPS
                      </span>
                      <span className="text-[10px] font-bold text-zinc-500">
                        {products.length} REAL PRODUCTS
                      </span>
                    </div>

                    {/* Native 2-Column Product Grid */}
                    <div className="grid grid-cols-2 gap-2.5">
                      {(composeCategory === 'All'
                        ? products
                        : products.filter(p => p.category.toLowerCase().includes(composeCategory.toLowerCase()) || p.title.toLowerCase().includes(composeCategory.toLowerCase()))
                      ).map((p) => (
                        <div
                          key={p.id}
                          className="bg-white rounded-xl overflow-hidden border border-zinc-200/80 shadow-xs flex flex-col"
                        >
                          <div className="h-32 bg-zinc-100 relative">
                            <img
                              src={p.featuredImage || p.images?.[0] || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80'}
                              alt={p.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            {p.discountPercent > 0 && (
                              <span className="absolute top-1.5 right-1.5 bg-amber-400 text-zinc-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                {p.discountPercent}% OFF
                              </span>
                            )}
                          </div>
                          <div className="p-2 flex-1 flex flex-col justify-between">
                            <p className="text-[11px] font-semibold text-zinc-900 line-clamp-1">
                              {p.title}
                            </p>
                            <div className="flex items-baseline gap-1 mt-1">
                              <span className="text-xs font-bold text-zinc-950">
                                ₹{Math.round(p.price)}
                              </span>
                              {p.compareAtPrice && p.compareAtPrice > p.price && (
                                <span className="text-[9px] text-zinc-400 line-through">
                                  ₹{Math.round(p.compareAtPrice)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Material 3 Bottom Navigation Bar */}
                  <div className="bg-white border-t border-zinc-200 px-3 py-1.5 flex items-center justify-around text-[10px] font-medium text-zinc-500">
                    <button
                      onClick={() => setComposeNavTab('home')}
                      className={`flex flex-col items-center gap-0.5 ${
                        composeNavTab === 'home' ? 'text-zinc-950 font-bold' : ''
                      }`}
                    >
                      <Home className="w-4 h-4" />
                      <span>Home</span>
                    </button>
                    <button
                      onClick={() => setComposeNavTab('shop')}
                      className={`flex flex-col items-center gap-0.5 ${
                        composeNavTab === 'shop' ? 'text-zinc-950 font-bold' : ''
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Shop</span>
                    </button>
                    <button
                      onClick={() => setComposeNavTab('search')}
                      className={`flex flex-col items-center gap-0.5 ${
                        composeNavTab === 'search' ? 'text-zinc-950 font-bold' : ''
                      }`}
                    >
                      <Search className="w-4 h-4" />
                      <span>Search</span>
                    </button>
                    <button
                      onClick={() => setComposeNavTab('wishlist')}
                      className={`flex flex-col items-center gap-0.5 ${
                        composeNavTab === 'wishlist' ? 'text-zinc-950 font-bold' : ''
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span>Wishlist</span>
                    </button>
                    <button
                      onClick={() => setComposeNavTab('account')}
                      className={`flex flex-col items-center gap-0.5 ${
                        composeNavTab === 'account' ? 'text-zinc-950 font-bold' : ''
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Account</span>
                    </button>
                  </div>

                  {/* Android Bottom Gesture Bar */}
                  <div className="h-4 bg-white flex justify-center items-center pb-1">
                    <div className="w-24 h-1 bg-zinc-400 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Feature Highlights & Quick Details */}
              <div className="max-w-md space-y-4">
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    Native Jetpack Compose Architecture
                  </h3>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Single Storefront Engine:</strong> Queries{' '}
                        <code>kukapi.myshopify.com</code> directly using Storefront GraphQL.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>100% Kotlin Coroutines:</strong> Non-blocking background fetch with Ktor HTTP client.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Zero Security Leaks:</strong> Shopify Admin and Cashfree private secrets stay completely off the device.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Material 3 Edge-to-Edge:</strong> Fluid typography, smooth touch animations, and hardware-accelerated Coil image caching.
                      </span>
                    </li>
                  </ul>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('code')}
                    className="flex-1 py-3 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-2 border border-zinc-700"
                  >
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    Inspect Kotlin Source
                  </button>
                  <button
                    onClick={() => setActiveTab('guide')}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                  >
                    <Terminal className="w-4 h-4" />
                    Build APK Guide
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KOTLIN CODE EXPLORER */}
          {activeTab === 'code' && (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              {/* File Sidebar */}
              <div className="w-full md:w-64 border-r border-zinc-800 bg-zinc-900/40 p-3 space-y-1 overflow-y-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-2 py-1 block">
                  Project Files (/android)
                </span>
                {Object.entries(androidFiles).map(([key, file]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedFile(key)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      selectedFile === key
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{file.label}</span>
                  </button>
                ))}
              </div>

              {/* Code Viewer Panel */}
              <div className="flex-1 flex flex-col bg-zinc-950 overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      {androidFiles[selectedFile]?.label}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {androidFiles[selectedFile]?.desc}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      handleCopyCode(
                        selectedFile,
                        androidFiles[selectedFile]?.code || ''
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-white transition-all border border-zinc-700"
                  >
                    {copiedKey === selectedFile ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-auto p-4 font-mono text-xs text-zinc-300 leading-relaxed bg-zinc-950">
                  <pre className="whitespace-pre">
                    <code>{androidFiles[selectedFile]?.code}</code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BUILD & RUN APK GUIDE */}
          {activeTab === 'guide' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-4xl mx-auto">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">
                  How to Build and Install KUKAPI Android App
                </h3>
                <p className="text-xs text-zinc-400">
                  Follow these instructions to compile the native APK on your computer or Android Studio.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Step 1 */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                      1
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Open in Android Studio
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Open Android Studio (Hedgehog, Iguana, or Jellyfish), choose <strong>Open Existing Project</strong>, and select the <code>/android</code> directory from this repository.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Build Debug APK via Terminal
                    </h4>
                  </div>
                  <div className="bg-black rounded-lg p-2.5 font-mono text-[11px] text-emerald-400">
                    cd android && ./gradlew assembleDebug
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    The generated APK will be at: <code>app/build/outputs/apk/debug/app-debug.apk</code>
                  </p>
                </div>

                {/* Step 3 */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Install on Physical Android Phone
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Connect your phone via USB with USB Debugging enabled, and run:
                  </p>
                  <div className="bg-black rounded-lg p-2.5 font-mono text-[11px] text-emerald-400">
                    adb install -r app/build/outputs/apk/debug/app-debug.apk
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                      4
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      Publish to Google Play Store
                    </h4>
                  </div>
                  <p className="text-xs text-zinc-300">
                    Run <code>./gradlew bundleRelease</code> to produce the Google Play <code>.aab</code> (Android App Bundle) with R8 shrinking enabled.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
