package com.kukapi.app.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class ApiDiagnosticInfo(
    val apiUrl: String = "https://kukapi.myshopify.com/api/2024-01/graphql.json",
    val httpStatus: Int = 200,
    val apiError: String? = null,
    val productCount: Int = 0,
    val firstProductTitle: String = "None",
    val firstProductImageUrl: String = "None",
    val latencyMs: Long = 0,
    val timestamp: String = "Just now"
) {
    val httpStatusCode: Int
        get() = httpStatus

    val parsedProductsCount: Int
        get() = productCount

    val apiErrorDescription: String
        get() = apiError ?: "None"
}
