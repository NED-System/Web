/**
 * Redirects the user to the appropriate app store based on their operating system.
 */
function downloadApp() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.nedsystem.movil";
    const appStoreUrl = "https://apps.apple.com/app/nedleal/id6760373778";

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        window.open(appStoreUrl, "_blank");
        return;
    }

    // Android detection
    if (/android/i.test(userAgent)) {
        window.open(playStoreUrl, "_blank");
        return;
    }

    // Default for desktop or other systems: Open Play Store
    // (Optional: Could show a modal or redirect to a landing page)
    window.open(playStoreUrl, "_blank");
}
