<script setup>
import { onMounted, ref, computed, watch } from "vue";
import MapView from "@arcgis/core/views/MapView";
import Basemap from "@arcgis/core/Basemap";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";
import { CountryService } from "@/service/CountryService";
import { useToast } from "primevue/usetoast";

// References
const mapViewDiv = ref(null);
const toast = useToast();
let view; // Declare `view` globally to manipulate it later

esriConfig.apiKey = "CuT30OwJRnb1Fuv9";
esriConfig.portalUrl = "https://vertex.gamuda.com.my/portal-au";

const countries = CountryService.getData();
const value = ref("Street");
const options = ref(["Street", "Imagery"]);

// Extract and compute country name
const countryCode = computed(() => esriConfig.portalUrl.split("-").pop().toUpperCase());
const countryName = computed(() => {
  const country = countries.find((c) => c.code === countryCode.value);
  return country ? country.name : "Unknown";
});

// Basemap definitions
const streetMap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer",
    }),
  ],
  title: "OpenStreetMap",
  id: "osm",
});

const imageryMap = new Basemap({
  baseLayers: [
    new TileLayer({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    }),
  ],
  title: "World Imagery",
  id: "world-imagery",
});

// Initialize the MapView
const initializeMapView = () => {
  const webmap = new WebMap({
    portalItem: {
      id: "4a260e461521476aaced9ed5ccd5a84b",
    },
    basemap: streetMap,
  });

  view = new MapView({
    container: mapViewDiv.value,
    map: webmap,
  });

  // Change cursor to drag while interacting with the map
  view.on("drag", () => {
    mapViewDiv.value.style.cursor = "grabbing";
  });

  view.on("drag-end", () => {
    mapViewDiv.value.style.cursor = "grab";
  });

  view.on("pointer-move", () => {
    mapViewDiv.value.style.cursor = "grab";
  });

  // Optional error handling for the view
  view.when(
    () => {
      console.log("MapView loaded successfully");
    },
    (error) => {
      console.error("Error loading MapView:", error);
    }
  );
};

// Watcher to update basemap
watch(value, (newValue) => {
  if (view) {
    if (newValue === "Street") {
      view.map.basemap = streetMap;
    } else if (newValue === "Imagery") {
      view.map.basemap = imageryMap;
    }
  }
});

const speedDialItems = ref([
  {
    label: "Street View",
    icon: "pi pi-map",
    command: () => {
      toast.add({ severity: "info", summary: "View Changed", detail: "Street View Selected", life: 3000 });
      value.value = "Street";
    },
  },
  {
    label: "Imagery View",
    icon: "pi pi-image",
    command: () => {
      toast.add({ severity: "info", summary: "View Changed", detail: "Imagery View Selected", life: 3000 });
      value.value = "Imagery";
    },
  },
]);

// Initialize map on mount
onMounted(() => {
  initializeMapView();
});
</script>

<template>
  <div class="grid grid-cols-12">
    <div class="col-span-12">
      <div class="card mb-0">
        <div class="mb-3 flex items-center justify-between">
          <h1 class="text-2xl font-semibold">{{ countryName }}</h1>
          <SelectButton v-model="value" :options="options" />
        </div>
        <!-- Map container -->
        <div ref="mapViewDiv" style="height: 500px; width: 100%">
          <SpeedDial
            :model="speedDialItems"
            direction="up"
            style="position: absolute; bottom: 70px; right: 70px;"
          />
        </div>
      </div>
    </div>
  </div>
</template>
