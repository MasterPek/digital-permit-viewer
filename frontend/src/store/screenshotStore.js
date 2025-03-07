import { defineStore } from "pinia";
import { toPng } from "html-to-image";

// FIXME: refmapviewdiv currently cannot be captured. Alternatively, change to canvas tag
// TODO: margin for screenshot
export const useScreenshotStore = defineStore("screenshot", {
    state: () => ({
        mapViewDiv: null,
        lastScreenshot: null,
        isCapturing: false,
        error: null,
    }),

    actions: {
        setMapViewDiv(divElement) {
            this.mapViewDiv = divElement;
        },

        // In your screenshotStore.js, modify the captureScreenshot method:
        async captureScreenshot() {
            this.lastScreenshot = null;
            this.error = null;
            this.isCapturing = true;

            if (!this.mapViewDiv) {
                this.error = "Map view div not found";
                this.isCapturing = false;
                return null;
            }

            try {
                // Add these options to handle ArcGIS resources better
                const dataUrl = await toPng(this.mapViewDiv, {
                    quality: 1,
                    pixelRatio: 2,
                    skipAutoScale: false,
                    cacheBust: true,
                    // Add these options
                    filter: (node) => {
                        // Skip problematic nodes if needed
                        return true; // Filter out problematic nodes if needed
                    },
                    // Skip embedding fonts and external resources that cause issues
                    fontEmbedCSS: "",
                    // Ignore certain resource fetch errors
                    imagePlaceholder:
                        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFhAJ/wlseKgAAAABJRU5ErkJggg==",
                    // Skip inline svg issues
                    skipFonts: true,
                    // Attempt to fix CORS issues
                    corsImg: true,
                });

                // Convert data URL to Blob
                const response = await fetch(dataUrl);
                const blob = await response.blob();

                if (!blob) {
                    this.error = "Failed to convert screenshot to Blob";
                    this.isCapturing = false;
                    return null;
                }

                this.lastScreenshot = blob;
                this.isCapturing = false;
                return blob;
            } catch (error) {
                console.error("Screenshot capture error:", error);
                this.error = `Screenshot capture failed: ${error.message}`;
                this.isCapturing = false;
                return null;
            }
        },
    },
});
