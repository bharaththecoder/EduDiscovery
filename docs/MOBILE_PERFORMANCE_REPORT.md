# EDUDISCOVERY — MOBILE PERFORMANCE & CAPACITOR AUDIT REPORT

**Target Platform:** Android (Capacitor 8.5.3)  
**Evaluation Scope:** Startup, Safe-Area Handling, Touch Ergonomics, Rendering, Memory & Native Auth  
**Date:** November 21, 2026  

---

## 1. Executive Summary

EduDiscovery is distributed both as a responsive web app and as a native Android APK packaged via Capacitor. This audit reviews the runtime characteristics, UI fluidity, safe-area metrics, and native device interactions on Android devices.

---

## 2. Core Mobile Metrics & Audit Findings

### 2.1 Touch Target Compliance
- **Standard:** Recommended minimum touch target size is 44x44 CSS pixels (WCAG 2.5.5 / Android Material guidelines).
- **Implementation:**
  - `src/index.css` provides the utility class `.tap-target-44`:
    ```css
    .tap-target-44 {
      min-width: 44px;
      min-height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    ```
  - Applied across critical navigation controls: BottomNav icons, theme toggle button, back navigation buttons, search filters, and profile action items.

### 2.2 Safe Area Inset Handling
- **Android Display Cutouts & Navigation Bars:**
  - `src/index.css` integrates standard CSS environment variables:
    ```css
    padding-bottom: env(safe-area-inset-bottom, 0px);
    padding-top: env(safe-area-inset-top, 0px);
    ```
  - Prevents the bottom navigation bar and sticky headers from overlapping Android system gesture navigation bars, notch cutouts, or camera holes.

### 2.3 Hardware Acceleration & Scroll Fluidity
- **CSS Properties Configured:**
  - `-webkit-overflow-scrolling: touch` for momentum-based scrolling.
  - `transform: translateZ(0)` on animated cards and fixed bottom navigation to leverage Android GPU layer compositing.
  - `will-change: transform` applied sparingly only on active interactive surfaces (`SpotlightCard`, `RippleButton`) to prevent excessive GPU memory allocations.

### 2.4 Native Authentication Flow (Capacitor)
- In `src/contexts/AuthContext.tsx`:
  - Detects native platform via `Capacitor.isNativePlatform()`.
  - On Android: delegates authentication to native Google Play Services via `@capacitor-firebase/authentication`, which retrieves a hardware-signed ID token.
  - Exits gracefully if Google Play Services is missing or if the user cancels the native account picker dialog.
  - Seamlessly exchanges the native ID token with Firebase Auth (`signInWithCredential(auth, GoogleAuthProvider.credential(idToken))`).

### 2.5 Image Loading & Memory Conservation
- Large campus photos and university banners use native browser `loading="lazy"` attributes.
- Profile picture uploads are checked on client-side before dispatch to ensure files remain <= 2 MB, preventing Out-Of-Memory (OOM) crashes on budget Android devices.

---

## 3. Capacitor Configuration Summary

- **App ID:** `com.edudiscovery.app`
- **App Name:** `EduDiscovery`
- **Web Directory:** `dist`
- **Plugins Verified:**
  - `@capacitor/core`: Core JavaScript bridge.
  - `@capacitor/android`: Native Android runtime.
  - `@capacitor/app`: Native app lifecycle events.
  - `@capacitor-firebase/authentication`: Native Google Play Services auth.
  - `@capacitor/cookies`: Standardized cookie management.
  - `@capacitor/http`: Native HTTP networking fallback.
