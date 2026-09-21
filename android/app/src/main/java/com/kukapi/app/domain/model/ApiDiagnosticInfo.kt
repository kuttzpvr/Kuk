package com.kukapi.app.domain.model

data class ApiDiagnosticInfo(
    val apiUrl: String = "https://kukapi.myshopify.com/api/2024-01/graphql.json",
    val httpStatus: Int = 0,
    val apiError: String? = null,
    val productCount: Int = 0,
    val firstProductTitle: String = "None",
    val firstProductImageUrl: String = "None",
    val latencyMs: Long = 0,
    val timestamp: String = ""
)
