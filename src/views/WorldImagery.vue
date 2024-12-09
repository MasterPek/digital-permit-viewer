<script setup>
import { ref, onMounted, watch } from "vue";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import { useBasemapStore } from "@/store/basemapStore";
import { streetMap, imageryMap } from "@/utils/basemap";

const basemapStore = useBasemapStore();
const mapViewDiv = ref(null);
let view;

esriConfig.apiKey = "YOUR_API_KEY"; // Replace with your actual API key
esriConfig.portalUrl = "https://vertex.gamuda.com.my/portal-au";

// Initialize the MapView
const initializeMapView = () => {
  const webmap = new WebMap({
    portalItem: { id: "4a260e461521476aaced9ed5ccd5a84b" }, // Replace with your actual WebMap ID
    basemap: basemapStore.currentBasemapId === "osm" ? streetMap : imageryMap,
  });

  view = new MapView({
    container: mapViewDiv.value,
    map: webmap,
  });

  view.when(
    () => console.log("WorldImagery loaded successfully"),
    (error) => console.error("Error loading WorldImagery:", error)
  );
};

// Watch for Basemap Changes
watch(
  () => basemapStore.currentBasemapId,
  (newBasemapId) => {
    if (view && view.map) {
      view.map.basemap = newBasemapId === "osm" ? streetMap : imageryMap;
    }
  }
);

onMounted(initializeMapView);
</script>

<template>
  <div class="grid grid-cols-12">
    <div class="col-span-12">
      <div class="card mb-0">
        <h1 class="text-2xl font-semibold">World Imagery View</h1>
        <div ref="mapViewDiv" style="height: 500px; width: 100%"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
