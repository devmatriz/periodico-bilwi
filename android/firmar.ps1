# Alinea y firma la APK y el AAB que deja Gradle, con la llave de android/llave/.
# Uso (desde android/):  .\gradlew.bat assembleRelease bundleRelease ; .\firmar.ps1
# La contraseña se lee de llave/LEEME-CLAVES.txt, que nunca se sube al repositorio.

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$java = "C:\Program Files\Java\jdk-17\bin"
$buildTools = "$env:LOCALAPPDATA\Android\Sdk\build-tools\36.1.0"
$keystore = "llave\bilwi-noticias.keystore"
$alias = "bilwi-noticias"

$line = (Select-String -Path "llave\LEEME-CLAVES.txt" -Pattern "Contraseña:").Line
$password = $line.Split(" ", [System.StringSplitOptions]::RemoveEmptyEntries)[1]

# APK: primero se alinea, después se firma (apksigner exige ese orden).
& "$buildTools\zipalign.exe" -f -p 4 "app\build\outputs\apk\release\app-release-unsigned.apk" "app-release-unsigned-aligned.apk"
& "$java\java.exe" -jar "$buildTools\lib\apksigner.jar" sign `
  --ks $keystore --ks-key-alias $alias --ks-pass "pass:$password" --key-pass "pass:$password" `
  --out "app-release-signed.apk" "app-release-unsigned-aligned.apk"

# AAB (para Google Play): se firma con jarsigner.
Copy-Item "app\build\outputs\bundle\release\app-release.aab" "app-release-bundle.aab" -Force
& "$java\jarsigner.exe" -keystore $keystore -storepass $password -keypass $password "app-release-bundle.aab" $alias | Out-Null

& "$java\java.exe" -jar "$buildTools\lib\apksigner.jar" verify --print-certs "app-release-signed.apk" | Select-String "SHA-256"
Get-ChildItem "app-release-signed.apk", "app-release-bundle.aab" | Select-Object Name, Length, LastWriteTime
