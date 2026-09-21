#!/usr/bin/env bash
echo "=== KUKAPI BUILD DIAGNOSTIC REPORT ==="
echo "Date: $(date)"
echo "----------------------------------------"

echo "[1] Java Version Check:"
if command -v java &> /dev/null; then
    java -version
else
    echo "Java not found in PATH"
fi

echo "----------------------------------------"
echo "[2] JAVA_HOME Check:"
echo "JAVA_HOME: ${JAVA_HOME:-Not Set}"

echo "----------------------------------------"
echo "[3] Gradle Wrapper Check:"
if [ -f "./android/gradlew" ]; then
    echo "gradlew exists at ./android/gradlew"
    (cd android && ./gradlew -version)
else
    echo "gradlew not found at ./android/gradlew"
fi

echo "----------------------------------------"
echo "[4] Environment Variables:"
env | grep -E "ANDROID|JAVA|PATH|CI|GITHUB" || true

echo "----------------------------------------"
echo "[5] Android Project Structure:"
ls -la ./android
