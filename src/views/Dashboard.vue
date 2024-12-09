<script setup>
import { ref, onMounted, computed, watch } from "vue";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import { CountryService } from "@/service/CountryService";
import { useToast } from "primevue/usetoast";
import { imageryMap, streetMap } from "@/utils/basemap";
import { useBasemapStore } from "@/store/basemapStore";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import IdentityManager from "@arcgis/core/identity/IdentityManager";

const basemapStore = useBasemapStore();

esriConfig.apiKey = "CuT30OwJRnb1Fuv9";
esriConfig.portalUrl = "https://vertex.gamuda.com.my/portal-au";

const mapViewDiv = ref(null);
const toast = useToast();
let view;
let webmap;

const groupedLayers = ref([
  { label: 'Survey', items: [] },
  { label: 'Design', items: [] },
  { label: 'Environment', items: [] },
  { label: 'Permit Area', items: [] }
]);

const treeNodes = ref([]);
const selectedNodes = ref([]);

// Prepare TreeSelect format from groupedLayers
const createTreeNodes = () => {
  treeNodes.value = groupedLayers.value.map((group) => ({
    key: group.label,
    label: group.label,
    children: group.items.map((layer) => ({
      key: layer.id,
      label: layer.title,
    })),
  }));
};

// Country Info
const countries = CountryService.getData();
const countryCode = computed(() => esriConfig.portalUrl.split("-").pop().toUpperCase());
const countryName = computed(() => {
  const country = countries.find((c) => c.code === countryCode.value);
  return country ? country.name : "Unknown";
});

// Basemap switcher
const initializeMapView = () => {
  webmap = new WebMap({
    portalItem: { id: "4a260e461521476aaced9ed5ccd5a84b" },
    basemap: basemapStore.currentBasemapId,
  });

  view = new MapView({
    container: mapViewDiv.value,
    map: webmap,
  });

  view.on("drag", () => (mapViewDiv.value.style.cursor = "grabbing"));
  view.on("drag-end", () => (mapViewDiv.value.style.cursor = "grab"));
  view.on("pointer-move", () => (mapViewDiv.value.style.cursor = "grab"));

  view.when(
    () => {
      console.log("MapView loaded successfully");
      loadLayers();
    },
    (error) => console.error("Error loading MapView:", error)
  );
};

const loadLayers = () => {
  // Create FeatureLayers for the Permit Area
  const pointLayer = new FeatureLayer({
    url: "https://vertex.gamuda.com.my/arcgis-au/rest/services/Hosted/DigitalPermit/FeatureServer/0",
    title: "Permit Area Points",
    visible: true,
  });

  const polygonLayer = new FeatureLayer({
    url: "https://vertex.gamuda.com.my/arcgis-au/rest/services/Hosted/DigitalPermit/FeatureServer/1",
    title: "Permit Area Polygons",
    visible: true,
  });

  const annotationLayer = new FeatureLayer({
    url: "https://vertex.gamuda.com.my/arcgis-au/rest/services/Hosted/DigitalPermit/FeatureServer/2",
    title: "Permit Area Annotations",
    visible: true,
  });

  // Add layers to the map
  webmap.addMany([pointLayer, polygonLayer, annotationLayer]);

  // Call function to process layers and categorize them
  processLayers(webmap.allLayers);
};

const addLayerToCategory = (layer) => {
  const layerInfo = {
    title: layer.title,
    id: layer.id,
  };

  const title = layer.title.toUpperCase();

  if (
    title.includes("PERMIT AREA")
  ) {
    // Correctly categorize Permit Area layers
    groupedLayers.value[3].items.push(layerInfo);
  } else if (
    title.includes("SURVEY") || 
    title.includes("CULTURAL") || 
    title.includes("DARUMBAL") || 
    title.includes("GAANGALU")
  ) {
    groupedLayers.value[0].items.push(layerInfo);
  } else if (
    title.includes("ENVIRONMENT") || 
    title.includes("EPBC") || 
    title.includes("GLIDER") || 
    title.includes("CYCAS")
  ) {
    groupedLayers.value[2].items.push(layerInfo);
  } else {
    // Default to the Design group if not matched elsewhere
    groupedLayers.value[1].items.push(layerInfo);
  }
};

const processLayers = (layers) => {
  layers.forEach((layer) => {
    if (layer.type !== "base-tile" && layer.type !== "base-vector" && !layer.baseMap && layer.title !== "OpenStreetMap v2") {
      if (layer.layers && layer.layers.length > 0) {
        // If it's a group layer, process its sublayers
        processLayers(layer.layers);
      } else {
        // If it's an individual layer, add it to the appropriate category
        addLayerToCategory(layer);
      }
    }
  });
};

onMounted(initializeMapView);

// Handle basemap change
const getBasemapById = (id) => {
  return id === "osm" ? streetMap : imageryMap;
};

watch(groupedLayers, createTreeNodes, { deep: true });

// Log changes when TreeSelect selections change
watch(selectedNodes, (newValue) => {
  console.log("Selected Layers:", JSON.parse(JSON.stringify(newValue)));
});

// watch(
//   selectedLayers,
//   (newVal) => {
//     console.log("Selected Layers:", JSON.parse(JSON.stringify(newVal)));
//   },
//   { immediate: true, deep: true }
// );

// watch(
//   () => basemapStore.currentBasemapId,
//   (newBasemapId) => {
//     if (view && view.map) {
//       view.map.basemap = getBasemapById(newBasemapId); 
//     }
//   }
// );

// SpeedDial Commands
const speedDialItems = ref([
  {
    label: "Street View",
    icon: "pi pi-map",
    command: () => {
      basemapStore.setBasemap("osm");
      toast.add({
        severity: "info",
        summary: "View Changed",
        detail: "Street View Selected",
        life: 3000,
      });
    },
  },
  {
    label: "Imagery View",
    icon: "pi pi-image",
    command: () => {
      basemapStore.setBasemap("world-imagery");
      toast.add({
        severity: "info",
        summary: "View Changed",
        detail: "Imagery View Selected",
        life: 3000,
      });
    },
  },
]);

</script>

<template>
  <div class="grid grid-cols-12">
    <div class="col-span-12">
      <div class="card mb-0">
        <div class="mb-3 flex items-center justify-between">
          <!-- <MultiSelect v-model="selectedLayers" :options="groupedLayers" optionLabel="title" filter optionGroupLabel="label" optionGroupChildren="items" display="chip" placeholder="Select Layers" class="w-full md:w-80">
            <template #optiongroup="slotProps">
              <div class="flex items-center">
                <img :alt="slotProps.option.label" src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png" :class="`mr-2`" />
                <div>{{ slotProps.option.label }}</div>
              </div>
            </template>
          </MultiSelect> -->
          <TreeSelect
            v-model="selectedNodes"
            :options="treeNodes"
            selectionMode="checkbox"
            placeholder="Select Layers"
            class="md:w-80 w-full"
            display="chip"
          />
          <h1 class="text-2xl font-semibold">{{ countryName }}</h1>
        </div>
        <div ref="mapViewDiv" style="height: 500px; width: 100%; position: relative">
          <SpeedDial
            :model="speedDialItems"
            direction="up"
            style="position: absolute; bottom: 10px; right: 10px;"
          />
        </div>
      </div>
    </div>
  </div>
</template>
