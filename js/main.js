/**
 * Redirects the user to the appropriate app store based on their operating system.
 */
function downloadApp() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.nedsystem.movil";
    const appStoreUrl = "https://apps.apple.com/app/nedleal/id6760373778";

    // iOS or Mac detection
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isMac = /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS || isMac) {
        window.open(appStoreUrl, "_blank");
        return;
    }

    // Android detection
    if (/android/i.test(userAgent)) {
        window.open(playStoreUrl, "_blank");
        return;
    }

    // Default for other desktop systems (Windows/Linux): Open Play Store
    window.open(playStoreUrl, "_blank");
}

