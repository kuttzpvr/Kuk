package com.kukapi.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import com.kukapi.app.core.designsystem.KukapiTheme
import com.kukapi.app.presentation.KukapiMainApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            KukapiTheme {
                Surface(
                    modifier = Modifier.fillMaxSize()
                ) {
                    KukapiMainApp()
                }
            }
        }
    }
}
