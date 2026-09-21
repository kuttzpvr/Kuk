package com.kukapi.app

import android.app.Application

class KukapiApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize network monitor, offline cache, and image pipeline
    }
}
