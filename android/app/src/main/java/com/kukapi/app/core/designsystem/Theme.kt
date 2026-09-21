package com.kukapi.app.core.designsystem

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = KukapiWhite,
    onPrimary = KukapiBlack,
    secondary = KukapiZinc400,
    onSecondary = KukapiWhite,
    background = KukapiBlack,
    onBackground = KukapiWhite,
    surface = KukapiZinc900,
    onSurface = KukapiWhite,
    surfaceVariant = KukapiZinc800,
    onSurfaceVariant = KukapiZinc200
)

private val LightColorScheme = lightColorScheme(
    primary = KukapiBlack,
    onPrimary = KukapiWhite,
    secondary = KukapiZinc700,
    onSecondary = KukapiWhite,
    background = KukapiZinc50,
    onBackground = KukapiZinc900,
    surface = KukapiWhite,
    onSurface = KukapiZinc900,
    surfaceVariant = KukapiZinc100,
    onSurfaceVariant = KukapiZinc700
)

@Composable
fun KukapiTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
