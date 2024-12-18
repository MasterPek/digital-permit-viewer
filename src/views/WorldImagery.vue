<script setup>
import { ref, onMounted, watch } from "vue";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import { useBasemapStore } from "@/store/basemapStore";
import { streetMap, imageryMap } from "@/utils/basemap";
import AppSidebarMap from "@/layout/AppSidebarMap.vue";
import DrawerWebmap from "@/components/DrawerWebmap.vue";
import { NodeService } from "@/service/NodeService";

const basemapStore = useBasemapStore();

const mapViewDiv = ref(null);
let view;

esriConfig.apiKey = "CuT30OwJRnb1Fuv9"; // Replace with your actual API key
esriConfig.portalUrl = "https://vertex.gamuda.com.my/portal-au";

const nodes = ref(null);
const selectedKey = ref(null);

// Initialize the MapView
const initializeMapView = () => {
  const webmap = new WebMap({
    portalItem: { id: "29c59d6b17f14ee7a2eb9bd88d444fc5" }, // Replace with your actual WebMap ID
    basemap: imageryMap,
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

onMounted (() => {
  initializeMapView();
  NodeService.getTreeNodes().then((data) => (nodes.value = data));
});
</script>

<template>
  <div class="map-container">
    <h1 class="text-2xl font-semibold mb-2">World Imagery View</h1>
    <div class="map-view" ref="mapViewDiv">
      
      <!-- Use the custom WebMapDrawer -->
      <DrawerWebmap v-model="isDrawerOpen">
        <!-- Custom drawer content -->
        <div>
          <Tree v-model:selectionKeys="selectedKey" :value="nodes" selectionMode="checkbox" style="margin: 0; padding: 0"></Tree>
        </div>
      </DrawerWebmap>
    </div>
  </div>
</template>

<style scoped>
.map-container {
  position: relative; /* Required for absolute positioning of the sidebar */
}

.map-view {
  position: relative; /* Ensures map view is the context for the sidebar */
  height: 800px; /* Ensure map has height */
  width: 100%;
}
</style>