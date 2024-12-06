<script setup>
import { onMounted, ref, computed } from "vue";
import MapView from "@arcgis/core/views/MapView";
import Basemap from "@arcgis/core/Basemap";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import TileLayer from "@arcgis/core/layers/TileLayer";
import { CountryService } from "@/service/CountryService";

// Reference for the map container
const mapViewDiv = ref(null);

esriConfig.apiKey = "CuT30OwJRnb1Fuv9";
esriConfig.portalUrl = "https://vertex.gamuda.com.my/portal-au";

const countries = CountryService.getData();

// Extract and Compute Country Name
const countryCode = computed(() =>
    esriConfig.portalUrl.split("-").pop().toUpperCase(),
);
const countryName = computed(() => {
    const country = countries.find((c) => c.code === countryCode.value);
    return country ? country.name : "Unknown";
});

const imageryView = () => {
    try {
        const imageryMap = new Basemap({
            baseLayers: [
                new TileLayer({
                    url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
                }),
            ],
            title: "World Imagery",
            id: "world-imagery",
        });

        const webmap = new WebMap({
            portalItem: {
                id: "4a260e461521476aaced9ed5ccd5a84b",
            },
            basemap: imageryMap,
        });

        let view = new MapView({
            container: mapViewDiv.value, // Assign the DOM element directly
            map: webmap,
        });
    } catch (error) {
        console.error(error);
    }
};

onMounted(() => {
    imageryView();
});
</script>

<template>
    <div class="grid grid-cols-12">
        <div class="col-span-12">
            <div class="card mb-0">
                <!-- Map container -->
                <h1 class="text-2xl mb-3 font-semibold">{{ countryName }}</h1>
                <div ref="mapViewDiv" style="height: 500px; width: 100%"></div>
            </div>
        </div>
    </div>
</template>
