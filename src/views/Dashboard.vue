<script setup>
import { useLayout } from '@/layout/composables/layout';
import { onMounted, ref, watch } from 'vue';
import MapView from '@arcgis/core/views/MapView';
import Map from '@arcgis/core/Map';
import Basemap from '@arcgis/core/Basemap';
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';

const { getPrimary, getSurface, isDarkTheme } = useLayout();

const mapViewDiv = ref(null); // Reference for the map container

onMounted(() => {
  // Create an OpenStreetMap basemap
  const openStreetMapBasemap = new Basemap({
    baseLayers: [
      new VectorTileLayer({
        url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer",
      }),
    ],
    title: "OpenStreetMap",
    id: "osm",
  });

  // Create the Map
  const map = new Map({
    basemap: openStreetMapBasemap,
  });

  // TODO fetch australia maps, login authentication
  // Create the MapView
  new MapView({
    container: mapViewDiv.value, // Reference to the container element
    map: map,
    center: [101.6869, 3.139], // Example: Center at Kuala Lumpur, Malaysia
    zoom: 12,
  });
});
</script>

<template>
    <div class="grid grid-cols-12">
      <div class="col-span-12">
        <div class="card mb-0">
          <!-- Map container -->
          <div ref="mapViewDiv" style="height: 500px; width: 100%;"></div>
        </div>
      </div>
    </div>
  </template>
