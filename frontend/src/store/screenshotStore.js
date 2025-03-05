import { defineStore } from 'pinia';
import { toPng } from 'html-to-image';

// FIXME: refmapviewdiv currently cannot be captured. Alternatively, change to canvas tag
// TODO: margin for screenshot
export const useScreenshotStore = defineStore('screenshot', {
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

    async captureScreenshot() {
      this.lastScreenshot = null;
      this.error = null;
      this.isCapturing = true;

      if (!this.mapViewDiv) {
        this.error = 'Map view div not found';
        this.isCapturing = false;
        return null;
      }

      try {
        // Capture the div as a Blob
        const dataUrl = await toPng(this.mapViewDiv, {
          quality: 1,
          pixelRatio: 2,
          skipAutoScale: false,
          cacheBust: true,
        });

        // Convert data URL to Blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        if (!blob) {
          this.error = 'Failed to convert screenshot to Blob';
          this.isCapturing = false;
          return null;
        }

        this.lastScreenshot = blob;
        this.isCapturing = false;
        return blob;
      } catch (error) {
        console.error('Screenshot capture error:', error);
        this.error = `Screenshot capture failed: ${error.message}`;
        this.isCapturing = false;
        return null;
      }
    },
  },
});