package com.kukapi.app.core.network

import android.util.Log
import com.kukapi.app.domain.model.ApiDiagnosticInfo
import com.kukapi.app.domain.model.Product
import com.kukapi.app.utils.ShopifyParser
import com.kukapi.app.utils.ShopifyParser.jsonObjectOrNull
import com.kukapi.app.utils.ShopifyParser.stringOrNull
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
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class LiveFetchResponse(
    val products: List<Product>,
    val diagnostic: ApiDiagnosticInfo
)

object ShopifyClient {
    private const val TAG = "KUKAPI_SHOPIFY_API"
    const val STORE_DOMAIN = "kukapi.myshopify.com"
    const val STOREFRONT_TOKEN = "c6a4d33e5fc2cd9775bd7c11bea98f9d"
    const val GRAPHQL_ENDPOINT = "https://$STORE_DOMAIN/api/2024-01/graphql.json"

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    private val httpClient = HttpClient(OkHttp) {
        install(ContentNegotiation) {
            json(json)
        }
    }

    suspend fun fetchLiveProducts(): Result<LiveFetchResponse> = withContext(Dispatchers.IO) {
        val startTime = System.currentTimeMillis()
        val timeStr = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())

        Log.i(TAG, "==========================================================")
        Log.i(TAG, "1. API URL: $GRAPHQL_ENDPOINT")
        Log.i(TAG, "2. AUTH TOKEN: ${STOREFRONT_TOKEN.take(8)}...${STOREFRONT_TOKEN.takeLast(4)}")
        Log.i(TAG, "3. INITIATING GRAPHQL QUERY FOR REAL KUKAPI PRODUCTS")

        try {
            val query = """
                query GetProducts {
                  shop {
                    name
                    description
                  }
                  products(first: 50) {
                    edges {
                      node {
                        id
                        title
                        handle
                        description
                        productType
                        vendor
                        tags
                        featuredImage {
                          url
                        }
                        images(first: 6) {
                          edges {
                            node {
                              url
                            }
                          }
                        }
                        priceRange {
                          minVariantPrice {
                            amount
                            currencyCode
                          }
                        }
                        compareAtPriceRange {
                          maxVariantPrice {
                            amount
                            currencyCode
                          }
                        }
                        variants(first: 20) {
                          edges {
                            node {
                              id
                              title
                              price { amount }
                              compareAtPrice { amount }
                              availableForSale
                              selectedOptions {
                                name
                                value
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
            """.trimIndent()

            val requestBody = buildJsonObject {
                put("query", query)
            }.toString()

            val response = httpClient.post(GRAPHQL_ENDPOINT) {
                contentType(ContentType.Application.Json)
                header("X-Shopify-Storefront-Access-Token", STOREFRONT_TOKEN)
                setBody(requestBody)
            }

            val elapsed = System.currentTimeMillis() - startTime
            val statusCode = response.status.value
            val responseBody = response.bodyAsText()

            Log.i(TAG, "4. HTTP STATUS: $statusCode (${elapsed}ms)")
            Log.d(TAG, "5. RESPONSE BODY: $responseBody")

            if (statusCode !in 200..299) {
                val errorMsg = "HTTP $statusCode: $responseBody"
                Log.e(TAG, "6. API ERROR: $errorMsg")
                val diag = ApiDiagnosticInfo(
                    apiUrl = GRAPHQL_ENDPOINT,
                    httpStatus = statusCode,
                    apiError = errorMsg,
                    productCount = 0,
                    firstProductTitle = "None",
                    firstProductImageUrl = "None",
                    latencyMs = elapsed,
                    timestamp = timeStr
                )
                return@withContext Result.failure(Exception(errorMsg))
            }

            // Parse response safely with dedicated ShopifyParser
            val parseResult = ShopifyParser.parseProductsResponse(responseBody)
            if (parseResult.isFailure) {
                val error = parseResult.exceptionOrNull()
                val errorMsg = error?.message ?: "Unknown parsing error"
                Log.e(TAG, "PARSING ERROR: $errorMsg", error)
                val diag = ApiDiagnosticInfo(
                    apiUrl = GRAPHQL_ENDPOINT,
                    httpStatus = statusCode,
                    apiError = "JSON Parsing Error: $errorMsg",
                    productCount = 0,
                    firstProductTitle = "None",
                    firstProductImageUrl = "None",
                    latencyMs = elapsed,
                    timestamp = timeStr
                )
                return@withContext Result.failure(Exception("JSON Parsing Error: $errorMsg"))
            }

            val products = parseResult.getOrThrow()

            val firstTitle = products.firstOrNull()?.title ?: "None"
            val firstImg = products.firstOrNull()?.imageUrl ?: "None"

            Log.i(TAG, "7. PRODUCT COUNT: ${products.size}")
            Log.i(TAG, "8. FIRST PRODUCT TITLE: $firstTitle")
            Log.i(TAG, "9. FIRST PRODUCT IMAGE URL: $firstImg")
            Log.i(TAG, "==========================================================")

            val diagnostic = ApiDiagnosticInfo(
                apiUrl = GRAPHQL_ENDPOINT,
                httpStatus = statusCode,
                apiError = null,
                productCount = products.size,
                firstProductTitle = firstTitle,
                firstProductImageUrl = firstImg,
                latencyMs = elapsed,
                timestamp = timeStr
            )

            Result.success(LiveFetchResponse(products = products, diagnostic = diagnostic))
        } catch (e: Exception) {
            val elapsed = System.currentTimeMillis() - startTime
            Log.e(TAG, "API EXCEPTION: ${e.message}", e)
            val diag = ApiDiagnosticInfo(
                apiUrl = GRAPHQL_ENDPOINT,
                httpStatus = 0,
                apiError = e.message ?: "Connection Exception",
                productCount = 0,
                firstProductTitle = "None",
                firstProductImageUrl = "None",
                latencyMs = elapsed,
                timestamp = timeStr
            )
            Result.failure(e)
        }
    }
}
