# KUKAPI Proguard Rules
-keep class com.kukapi.app.domain.model.** { *; }
-keepclassmembers class * {
    @kotlinx.serialization.Serializable <fields>;
}
