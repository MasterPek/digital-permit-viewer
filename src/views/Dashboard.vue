<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import { CountryService } from "@/service/CountryService";
import { useToast } from "primevue/usetoast";
import { imageryMap, streetMap } from "@/utils/basemap";
import { useBasemapStore } from "@/store/basemapStore";

const basemapStore = useBasemapStore();

esriConfig.apiKey = "CuT30OwJRnb1Fuv9";
esriConfig.portalUrl = "https://vertex.gamuda.com.my/portal-au";

const mapViewDiv = ref(null);
const toast = useToast();
let view;
let webmap;

const treeNodes = ref([]);
const selectedNodes = ref({});

// Country Info
const countries = CountryService.getData();
const countryCode = computed(() =>
    esriConfig.portalUrl.split("-").pop().toUpperCase(),
);
const countryName = computed(() => {
    const country = countries.find((c) => c.code === countryCode.value);
    return country ? country.name : "Unknown";
});

const transformLayerToTreeNode = (layerData, checkedState = {}) => {
    // Recursively transform layer data to tree nodes
    const transformLayer = (layer) => {
        const children = Array.isArray(layer.items)
            ? layer.items.map(transformLayer)
            : [];

        const checked = checkedState[layer.id]?.checked || layer.visible;
        const partialChecked = checkedState[layer.id]?.partialChecked || 
            (children.length > 0 && 
             children.some(child => child.checked || child.partialChecked) && 
             !children.every(child => child.checked));

        return {
            key: layer.id,
            label: layer.title,
            selectable: true,
            checked: checked,
            partialChecked: partialChecked,
            children: children.length > 0 ? children : undefined,
            data: {
                visible: layer.visible,
                type: layer.type,
                url: layer.url,
            },
        };
    };

    return transformLayer(layerData);
};


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
            fetchAllLayers();
        },
        (error) => console.error("Error loading MapView:", error),
    );
};

const fetchAllLayers = async () => {
    try {
        const operationalLayers = webmap.layers.toArray();

        const operationalLayerData = operationalLayers.map((layer) => {
            const layerData = {
                id: layer.id,
                title: layer.title,
                type: layer.type,
                visible: layer.visible,
                items: [],
            };

            const extractItemTitles = (items) => {
                return items.map((item) => {
                    const itemData = {
                        id: item.id,
                        title: item.title,
                        type: item.type,
                        visible: item.visible,
                        url: item.url,
                        items:
                            item.layers && item.layers.items
                                ? extractItemTitles(item.layers.items)
                                : [],
                    };
                    return itemData;
                });
            };

            if (layer.layers && layer.layers.items) {
                layerData.items = extractItemTitles(layer.layers.items);
            }

            return layerData;
        });

        // Transform layer data to TreeSelect nodes with checked state
        treeNodes.value = operationalLayerData.map((layer) => 
            transformLayerToTreeNode(layer, selectedNodes.value)
        );

        const updateSelectedNodes = (layer) => {
            if (layer.visible) {
                selectedNodes.value[layer.id] = { 
                    checked: true, 
                    partialChecked: false 
                };
            } else {
                selectedNodes.value[layer.id] = { 
                    checked: false, 
                    partialChecked: layer.items && layer.items.length > 0 
                };
            }
            
            // Recursively update child layers
            if (layer.items) {
                layer.items.forEach(updateSelectedNodes);
            }
        };

        operationalLayerData.forEach(updateSelectedNodes);

        console.log("selectedNodes:", selectedNodes.value);
        console.log("treeNodes:", treeNodes.value);

    } catch (error) {
        console.error("Error fetching layers:", error);
    }
};

// Watch for selected nodes and update layer visibility
watch(selectedNodes, (newSelectedNodes) => {
    // Ensure it's always an array
    const selectedNodeKeys = Array.isArray(newSelectedNodes)
        ? newSelectedNodes
        : [newSelectedNodes].filter(Boolean);

    console.log("Selection Changed:", { newSelectedNodes });

    if (view && view.map) {
        view.map.layers.forEach((layer) => {
            const isVisible = selectedNodeKeys.includes(layer.id);

            if (layer.visible !== isVisible) {
                console.log(
                    `Layer ${layer.id} visibility changed to: ${isVisible}`
                );
            }
            layer.visible = isVisible;
        });
    }
});

// Basemap change logic
const getBasemapById = (id) => {
    return id === "osm" ? streetMap : imageryMap;
};

watch(
    () => basemapStore.currentBasemapId,
    (newBasemapId) => {
        if (view && view.map) {
            view.map.basemap = getBasemapById(newBasemapId);
        }
    },
);

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

onMounted(initializeMapView);
</script>

<template>
    <div class="grid grid-cols-12">
        <div class="col-span-12">
            <div class="card mb-0">
                <div class="mb-3 flex items-center justify-between">
                    <TreeSelect v-model="selectedNodes" :options="treeNodes" selectionMode="checkbox"
                        placeholder="Select Layers" class="md:w-80 w-full" display="chip" />
                    <h1 class="text-2xl font-semibold">{{ countryName }}</h1>
                </div>
                <div ref="mapViewDiv" style="height: 500px; width: 100%; position: relative">
                    <SpeedDial :model="speedDialItems" direction="up"
                        style="position: absolute; bottom: 10px; right: 10px" />
                </div>
            </div>
        </div>
    </div>
</template>