package com.kukapi.app.domain.repository

import android.util.Log
import com.kukapi.app.core.network.LiveFetchResponse
import com.kukapi.app.core.network.ShopifyClient
import com.kukapi.app.domain.model.ApiDiagnosticInfo
import com.kukapi.app.domain.model.Product
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ProductRepository(
    private val client: ShopifyClient = ShopifyClient
) {
    companion object {
        private const val TAG = "KUKAPI_REPOSITORY"
    }

    /**
     * Fetches real live products from Kukapi Shopify Storefront API with comprehensive logging.
     */
    suspend fun getLiveCatalog(): Result<LiveFetchResponse> = withContext(Dispatchers.IO) {
        Log.i(TAG, "Requesting live catalog from Shopify Storefront API...")
        val result = client.fetchLiveProducts()
        result.onSuccess { response ->
            Log.i("KUKAPI_PIPELINE", "[REPOSITORY] products = ${response.products.size}")
        }
        result
    }
}
