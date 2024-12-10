<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import { CountryService } from "@/service/CountryService";
import { useToast } from "primevue/usetoast";
import { imageryMap, streetMap } from "@/utils/basemap";
import { useBasemapStore } from "@/store/basemapStore";
import Query from "@arcgis/core/rest/support/Query";
import FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import IdentityManager from "@arcgis/core/identity/IdentityManager";

const basemapStore = useBasemapStore();

esriConfig.apiKey = "CuT30OwJRnb1Fuv9";
esriConfig.portalUrl = "https://vertex.gamuda.com.my/portal-au";

const mapViewDiv = ref(null);
const toast = useToast();
let view;
let webmap;

const treeNodes = ref([]);
const selectedNodes = ref(null);

// Country Info
const countries = CountryService.getData();
const countryCode = computed(() =>
    esriConfig.portalUrl.split("-").pop().toUpperCase(),
);
const countryName = computed(() => {
    const country = countries.find((c) => c.code === countryCode.value);
    return country ? country.name : "Unknown";
});

// Transform layer data to TreeSelect compatible format
const transformLayerToTreeNode = (layerData) => {
    const node = {
        key: layerData.id,
        label: layerData.title,
        selectable: true,
        children: layerData.items.length > 0 
            ? layerData.items.map(item => transformLayerToTreeNode(item))
            : undefined,
        data: {
            visible: layerData.visible,
            type: layerData.type,
            url: layerData.url
        }
    };
    return node;
};

// Collect all visible layer keys recursively
const collectVisibleLayerKeys = (nodes) => {
    const visibleKeys = [];
    
    const traverse = (node) => {
        // If the node itself is visible, add its key
        if (node.data && node.data.visible) {
            visibleKeys.push(node.key);
        }
        
        // Recursively check children
        if (node.children) {
            node.children.forEach(traverse);
        }
    };

    nodes.forEach(traverse);
    return visibleKeys;
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

        // Transform layer data to TreeSelect nodes
        treeNodes.value = operationalLayerData.map(transformLayerToTreeNode);

        // Prepare for initial selection
        await nextTick(); // Ensure DOM is updated

        // Pre-select visible layers
        const initialSelectedKeys = collectVisibleLayerKeys(treeNodes.value);
        selectedNodes.value = initialSelectedKeys;

        console.log("Tree Nodes:", treeNodes.value);
        console.log("Selected Nodes:", selectedNodes.value);
    } catch (error) {
        console.error("Error fetching layers:", error);
    }
};

// Watch for selected nodes and update layer visibility
watch(selectedNodes, (newSelectedNodes) => {
  console.log("Selected Nodes:", newSelectedNodes);
  
    if (view && view.map) {
        // Ensure newSelectedNodes is an array
        const selectedNodeKeys = Array.isArray(newSelectedNodes) 
            ? newSelectedNodes 
            : [newSelectedNodes].filter(Boolean);

        // Iterate through layers to update visibility
        view.map.layers.forEach(layer => {
            layer.visible = selectedNodeKeys.includes(layer.id);
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
                <div
                    ref="mapViewDiv"
                    style="height: 500px; width: 100%; position: relative"
                >
                    <SpeedDial
                        :model="speedDialItems"
                        direction="up"
                        style="position: absolute; bottom: 10px; right: 10px"
                    />
                </div>
            </div>
        </div>
    </div>
</template>