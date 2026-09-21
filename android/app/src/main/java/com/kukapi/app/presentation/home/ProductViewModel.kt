package com.kukapi.app.presentation.home

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.kukapi.app.domain.model.*
import com.kukapi.app.domain.repository.ProductRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed interface ProductUiState {
    data class Loading(val message: String = "Connecting to Shopify Storefront...") : ProductUiState
    data class Success(
        val products: List<Product>,
        val totalProductsCount: Int,
        val diagnostic: ApiDiagnosticInfo
    ) : ProductUiState
    data class Empty(
        val message: String = "No products found in Shopify store",
        val diagnostic: ApiDiagnosticInfo? = null
    ) : ProductUiState
    data class Error(
        val title: String = "Network Error",
        val message: String,
        val diagnostic: ApiDiagnosticInfo? = null,
        val canRetry: Boolean = true
    ) : ProductUiState
}

class ProductViewModel(
    private val repository: ProductRepository = ProductRepository()
) : ViewModel() {

    companion object {
        private const val TAG = "KUKAPI_VIEWMODEL"
    }

    private val _uiState = MutableStateFlow<ProductUiState>(ProductUiState.Loading())
    val uiState: StateFlow<ProductUiState> = _uiState.asStateFlow()

    private val _showDiagnostic = MutableStateFlow(false)
    val showDiagnostic: StateFlow<Boolean> = _showDiagnostic.asStateFlow()

    private val _latestDiagnostic = MutableStateFlow<ApiDiagnosticInfo?>(null)
    val latestDiagnostic: StateFlow<ApiDiagnosticInfo?> = _latestDiagnostic.asStateFlow()

    private var allProducts: List<Product> = emptyList()
    private var selectedCategory: String = "all"

    // --- Cart & E-commerce State ---
    private val _cartItems = MutableStateFlow<List<CartItem>>(emptyList())
    val cartItems: StateFlow<List<CartItem>> = _cartItems.asStateFlow()

    private val _appliedCoupon = MutableStateFlow<String?>(null)
    val appliedCoupon: StateFlow<String?> = _appliedCoupon.asStateFlow()

    private val _couponError = MutableStateFlow<String?>(null)
    val couponError: StateFlow<String?> = _couponError.asStateFlow()

    // --- Wishlist State ---
    private val _wishlist = MutableStateFlow<Set<String>>(emptySet())
    val wishlist: StateFlow<Set<String>> = _wishlist.asStateFlow()

    // --- Admin Config State ---
    private val _adminConfig = MutableStateFlow(AdminConfig())
    val adminConfig: StateFlow<AdminConfig> = _adminConfig.asStateFlow()

    // --- Notifications State ---
    private val _notifications = MutableStateFlow<List<NotificationItem>>(
        listOf(
            NotificationItem("notif-1", "Flash Drop Live", "Heavyweight 240 GSM hoodies are now live in limited batches.", "10m ago", isRead = false, type = "drop"),
            NotificationItem("notif-2", "Order Confirmed", "Your order #KUK-8921 is confirmed and being prepared at Surat hub.", "2h ago", isRead = false, type = "order"),
            NotificationItem("notif-3", "VIP Discount Unlocked", "Use code KUKAPI10 for 10% instant off on cart value above ₹999.", "1d ago", isRead = true, type = "promo")
        )
    )
    val notifications: StateFlow<List<NotificationItem>> = _notifications.asStateFlow()

    // --- Customer Authentication & Addresses ---
    private val _customerSession = MutableStateFlow<CustomerSession?>(
        CustomerSession(
            accessToken = "shopify-live-token",
            expiresAt = "2026-12-31",
            email = "vip.shopper@kukapi.com",
            firstName = "Arjun",
            lastName = "Kapoor",
            phone = "+91 98200 12345",
            tier = "VIP Gold",
            points = 850
        )
    )
    val customerSession: StateFlow<CustomerSession?> = _customerSession.asStateFlow()
    val currentUser: StateFlow<CustomerSession?> = _customerSession.asStateFlow()

    private val _savedAddresses = MutableStateFlow<List<ShippingAddress>>(
        listOf(
            ShippingAddress(
                id = "addr-1",
                name = "Arjun Kapoor",
                email = "vip.shopper@kukapi.com",
                phone = "+91 98200 12345",
                addressLine1 = "Flat 402, Signature Towers",
                addressLine2 = "Bandra West",
                city = "Mumbai",
                state = "Maharashtra",
                pincode = "400050",
                isDefault = true
            )
        )
    )
    val savedAddresses: StateFlow<List<ShippingAddress>> = _savedAddresses.asStateFlow()

    // --- Orders State ---
    private val _orders = MutableStateFlow<List<CustomerOrder>>(
        listOf(
            CustomerOrder(
                id = "ord-1",
                orderNumber = "KUK-98214",
                processedAt = "Today, 2:30 PM",
                totalPrice = 1598.0,
                financialStatus = "PAID",
                fulfillmentStatus = "IN TRANSIT",
                status = "shipped",
                estimatedDelivery = "Tomorrow by 8 PM",
                carrier = "Delhivery Express",
                trackingNumber = "DLV-98741203",
                items = listOf(
                    OrderItem("RIDERS OVERSIZED T SHIRT", 1, 799.0, "", "L / Black"),
                    OrderItem("HEAVYWEIGHT 240 GSM TEE", 1, 799.0, "", "XL / Off-White")
                )
            )
        )
    )
    val orders: StateFlow<List<CustomerOrder>> = _orders.asStateFlow()

    private val _currentTrackingOrder = MutableStateFlow<CustomerOrder?>(null)
    val currentTrackingOrder: StateFlow<CustomerOrder?> = _currentTrackingOrder.asStateFlow()

    // --- Search State ---
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _recentSearches = MutableStateFlow<List<String>>(
        listOf("240 GSM", "Oversized", "Chanderi Silk", "Black")
    )
    val recentSearches: StateFlow<List<String>> = _recentSearches.asStateFlow()

    init {
        loadProducts()
    }

    fun toggleDiagnostic(show: Boolean? = null) {
        _showDiagnostic.value = show ?: !_showDiagnostic.value
    }

    fun loadProducts(refresh: Boolean = false) {
        viewModelScope.launch {
            _uiState.value = ProductUiState.Loading(if (refresh) "Refreshing Shopify products..." else "Loading products from Shopify...")
            Log.i(TAG, "[VIEWMODEL LOAD START] (refresh=$refresh)")

            val result = repository.getLiveCatalog()

            result.fold(
                onSuccess = { response ->
                    allProducts = response.products
                    _latestDiagnostic.value = response.diagnostic

                    Log.i("KUKAPI_PIPELINE", "[VIEWMODEL] products = ${response.products.size}")

                    if (response.products.isEmpty()) {
                        Log.w(TAG, "[VIEWMODEL EMPTY] 0 products returned")
                        _uiState.value = ProductUiState.Empty(
                            message = "No products found in Kukapi Shopify Store",
                            diagnostic = response.diagnostic
                        )
                    } else {
                        Log.i(TAG, "[VIEWMODEL SUCCESS] Loaded ${response.products.size} real products")
                        val filtered = filterList(response.products, selectedCategory)
                        _uiState.value = ProductUiState.Success(
                            products = filtered,
                            totalProductsCount = response.products.size,
                            diagnostic = response.diagnostic
                        )
                    }
                },
                onFailure = { error ->
                    val errorDescription = error.localizedMessage ?: error.message ?: "Failed to connect to Shopify API"
                    Log.e(TAG, "[VIEWMODEL ERROR] $errorDescription", error)
                    
                    val fallbackDiag = ApiDiagnosticInfo(
                        apiUrl = "https://kukapi.myshopify.com/api/2024-01/graphql.json",
                        httpStatus = if (errorDescription.contains("401")) 401 else 0,
                        apiError = errorDescription,
                        productCount = 0,
                        firstProductTitle = "None",
                        firstProductImageUrl = "None"
                    )
                    _latestDiagnostic.value = fallbackDiag

                    _uiState.value = ProductUiState.Error(
                        title = "Shopify API Error",
                        message = errorDescription,
                        diagnostic = fallbackDiag,
                        canRetry = true
                    )
                }
            )
        }
    }

    fun getAllProducts(): List<Product> = allProducts

    fun getProductById(productId: String): Product? {
        val decodedId = try {
            java.net.URLDecoder.decode(productId, "UTF-8")
        } catch (e: Exception) {
            productId
        }
        return allProducts.find { it.id == productId || it.id == decodedId || it.id.endsWith(productId) }
    }

    fun selectCategory(category: String) {
        selectedCategory = category
        Log.d(TAG, "[CATEGORY SELECTED] $category")
        if (allProducts.isNotEmpty()) {
            val filtered = filterList(allProducts, category)
            val diag = _latestDiagnostic.value ?: ApiDiagnosticInfo()
            if (filtered.isEmpty()) {
                _uiState.value = ProductUiState.Empty(
                    message = "No products found in category '$category'",
                    diagnostic = diag
                )
            } else {
                _uiState.value = ProductUiState.Success(
                    products = filtered,
                    totalProductsCount = allProducts.size,
                    diagnostic = diag
                )
            }
        }
    }

    private fun filterList(products: List<Product>, cat: String): List<Product> {
        if (cat == "all" || cat.isBlank()) return products
        return products.filter { 
            it.category.contains(cat, ignoreCase = true) || 
            it.title.contains(cat, ignoreCase = true)
        }
    }

    // --- Cart Actions ---
    fun addToCart(product: Product, size: String = "L", color: String = "Black", quantity: Int = 1) {
        val current = _cartItems.value.toMutableList()
        val existingIndex = current.indexOfFirst { 
            it.product.id == product.id && it.selectedSize == size && it.selectedColor == color 
        }

        if (existingIndex != -1) {
            val existing = current[existingIndex]
            current[existingIndex] = existing.copy(quantity = existing.quantity + quantity)
        } else {
            val newItem = CartItem(
                id = "${product.id}_${size}_${color}_${System.currentTimeMillis()}",
                product = product,
                selectedSize = size,
                selectedColor = color,
                quantity = quantity,
                price = product.price
            )
            current.add(newItem)
        }
        _cartItems.value = current
    }

    fun removeFromCart(cartItemId: String) {
        _cartItems.value = _cartItems.value.filter { it.id != cartItemId }
    }

    fun updateCartQuantity(cartItemId: String, delta: Int) {
        val current = _cartItems.value.mapNotNull { item ->
            if (item.id == cartItemId) {
                val newQty = item.quantity + delta
                if (newQty > 0) item.copy(quantity = newQty) else null
            } else {
                item
            }
        }
        _cartItems.value = current
    }

    fun clearCart() {
        _cartItems.value = emptyList()
    }

    fun applyCoupon(code: String): Boolean {
        val clean = code.trim().uppercase()
        return when (clean) {
            "KUKAPI10" -> {
                _appliedCoupon.value = "KUKAPI10"
                _couponError.value = null
                true
            }
            "WELCOME500" -> {
                _appliedCoupon.value = "WELCOME500"
                _couponError.value = null
                true
            }
            "FLAT20" -> {
                _appliedCoupon.value = "FLAT20"
                _couponError.value = null
                true
            }
            else -> {
                _couponError.value = "Invalid coupon code"
                false
            }
        }
    }

    fun removeCoupon() {
        _appliedCoupon.value = null
        _couponError.value = null
    }

    fun getCartSubtotal(): Double {
        return _cartItems.value.sumOf { it.price * it.quantity }
    }

    fun getDiscountAmount(): Double {
        val subtotal = getCartSubtotal()
        return when (_appliedCoupon.value) {
            "KUKAPI10" -> subtotal * 0.10
            "WELCOME500" -> if (subtotal >= 1500) 500.0 else 0.0
            "FLAT20" -> subtotal * 0.20
            else -> 0.0
        }
    }

    fun getShippingFee(): Double {
        val subtotal = getCartSubtotal()
        return if (subtotal >= _adminConfig.value.freeShippingThreshold || subtotal == 0.0) 0.0 else _adminConfig.value.shippingFee
    }

    fun getGrandTotal(): Double {
        val subtotal = getCartSubtotal()
        val discount = getDiscountAmount()
        val shipping = getShippingFee()
        return maxOf(0.0, subtotal - discount + shipping)
    }

    // --- Wishlist Actions ---
    fun toggleWishlist(productId: String) {
        val current = _wishlist.value.toMutableSet()
        if (current.contains(productId)) {
            current.remove(productId)
        } else {
            current.add(productId)
        }
        _wishlist.value = current
    }

    fun isInWishlist(productId: String): Boolean = _wishlist.value.contains(productId)

    fun getWishlistProducts(): List<Product> {
        val wishlistSet = _wishlist.value
        return allProducts.filter { wishlistSet.contains(it.id) }
    }

    fun removeFromWishlist(productId: String) {
        val current = _wishlist.value.toMutableSet()
        current.remove(productId)
        _wishlist.value = current
    }

    // --- Admin Config ---
    fun updateAdminConfig(config: AdminConfig) {
        _adminConfig.value = config
    }

    // --- Notifications ---
    fun markAllNotificationsAsRead() {
        _notifications.value = _notifications.value.map { it.copy(isRead = true) }
    }

    fun getUnreadNotificationCount(): Int {
        return _notifications.value.count { !it.isRead }
    }

    // --- Customer Authentication & Addresses ---
    fun login(email: String, pass: String): Boolean {
        _customerSession.value = CustomerSession(
            accessToken = "token-${System.currentTimeMillis()}",
            expiresAt = "2026-12-31",
            email = email,
            firstName = email.substringBefore("@").replaceFirstChar { it.uppercase() },
            lastName = "Member"
        )
        return true
    }

    fun loginWithPhone(phoneNumber: String, name: String = "VIP Member"): Boolean {
        val cleanPhone = phoneNumber.trim()
        _customerSession.value = CustomerSession(
            accessToken = "token-${System.currentTimeMillis()}",
            expiresAt = "2026-12-31",
            email = "${cleanPhone.replace(Regex("[^0-9]"), "")}@kukapi.in",
            firstName = if (name.isNotBlank()) name else "VIP",
            lastName = "Member",
            phone = cleanPhone
        )
        return true
    }

    fun register(firstName: String, lastName: String, email: String, pass: String): Boolean {
        _customerSession.value = CustomerSession(
            accessToken = "token-${System.currentTimeMillis()}",
            expiresAt = "2026-12-31",
            email = email,
            firstName = firstName,
            lastName = lastName
        )
        return true
    }

    fun logout() {
        _customerSession.value = null
    }

    fun addAddress(address: ShippingAddress) {
        val current = _savedAddresses.value.toMutableList()
        if (address.isDefault) {
            current.replaceAll { it.copy(isDefault = false) }
        }
        current.add(address)
        _savedAddresses.value = current
    }

    fun deleteAddress(addressId: String) {
        _savedAddresses.value = _savedAddresses.value.filter { it.id != addressId }
    }

    fun setDefaultAddress(addressId: String) {
        _savedAddresses.value = _savedAddresses.value.map {
            it.copy(isDefault = it.id == addressId)
        }
    }

    // --- Orders ---
    fun createOrder(paymentMethod: String, address: ShippingAddress?): CustomerOrder {
        val cart = _cartItems.value
        val items = cart.map {
            OrderItem(
                title = it.product.title,
                quantity = it.quantity,
                price = it.price,
                imageUrl = it.product.imageUrl,
                variantTitle = "${it.selectedSize} / ${it.selectedColor}"
            )
        }
        val order = CustomerOrder(
            id = "ord-${System.currentTimeMillis()}",
            orderNumber = "KUK-${(10000..99999).random()}",
            processedAt = "Just now",
            totalPrice = getGrandTotal(),
            financialStatus = if (paymentMethod.contains("COD", ignoreCase = true)) "PENDING COD" else "PAID",
            fulfillmentStatus = "PROCESSING",
            status = "confirmed",
            estimatedDelivery = "3-4 Business Days",
            carrier = "Delhivery Express",
            trackingNumber = "DLV-${(10000000..99999999).random()}",
            items = items
        )
        _orders.value = listOf(order) + _orders.value
        _currentTrackingOrder.value = order
        clearCart()
        return order
    }

    fun setTrackingOrder(order: CustomerOrder) {
        _currentTrackingOrder.value = order
    }

    // --- Search ---
    val searchHistory: StateFlow<List<String>> = _recentSearches.asStateFlow()

    fun setSearchQuery(query: String) {
        _searchQuery.value = query
    }

    fun addSearchHistory(query: String) = addRecentSearch(query)

    fun clearSearchHistory() = clearRecentSearches()

    fun addRecentSearch(query: String) {
        val trimmed = query.trim()
        if (trimmed.isNotBlank()) {
            val current = _recentSearches.value.toMutableList()
            current.remove(trimmed)
            current.add(0, trimmed)
            _recentSearches.value = current.take(6)
        }
    }

    fun clearRecentSearches() {
        _recentSearches.value = emptyList()
    }
}

