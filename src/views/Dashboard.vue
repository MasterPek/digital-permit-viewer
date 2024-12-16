<script setup>
import { ref, onMounted, computed, watch } from "vue";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import Popup from "@arcgis/core/widgets/Popup";
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
    const transformLayer = (layer) => {
        const children = layer.items
            ? layer.items.map(transformLayer)
            : [];

        const checked = checkedState[layer.id]?.checked ?? layer.visible;
        const partialChecked = 
            children.length > 0 &&
            children.some(child => child.checked || child.partialChecked) &&
            !children.every(child => child.checked);

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
                parentId: layer.parentId // Add parent ID for reference
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
        popup: new Popup({
            dockEnabled: true,
            dockOptions: {
              position: "top-left",
              buttonEnabled: false,
              offset: [20, 20],
              breakpoint: false
            },
          }),
        container: mapViewDiv.value,
        map: webmap,
    });

    // view.on("drag", () => (mapViewDiv.value.style.cursor = "grabbing"));
    // view.on("drag-end", () => (mapViewDiv.value.style.cursor = "grab"));
    // view.on("pointer-move", () => (mapViewDiv.value.style.cursor = "grab"));

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
            const extractLayerHierarchy = (layerOrGroup) => {
                // Handle group layers and nested layers
                if (layerOrGroup.layers && layerOrGroup.layers.items) {
                    return {
                        id: layerOrGroup.id,
                        title: layerOrGroup.title,
                        type: layerOrGroup.type,
                        visible: layerOrGroup.visible,
                        items: layerOrGroup.layers.items.map(childLayer => ({
                            id: childLayer.id,
                            parentId: layerOrGroup.id,
                            title: childLayer.title,
                            type: childLayer.type,
                            visible: childLayer.visible,
                            url: childLayer.url
                        }))
                    };
                }
                
                // Handle individual layers
                return {
                    id: layerOrGroup.id,
                    title: layerOrGroup.title,
                    type: layerOrGroup.type,
                    visible: layerOrGroup.visible,
                    url: layerOrGroup.url
                };
            };

            return extractLayerHierarchy(layer);
        });

        // Transform layer data to TreeSelect nodes with checked state
        treeNodes.value = operationalLayerData.map((layer) =>
            transformLayerToTreeNode(layer, selectedNodes.value)
        );

        const updateSelectedNodes = (layer) => {
            // Update the checked state for the current layer
            selectedNodes.value[layer.id] = {
                checked: layer.visible,
                partialChecked: false
            };

            // Recursively update child layers
            if (layer.items) {
                layer.items.forEach(childLayer => {
                    selectedNodes.value[childLayer.id] = {
                        checked: childLayer.visible,
                        partialChecked: false
                    };
                });
            }
        };

        operationalLayerData.forEach(updateSelectedNodes);

        console.log("selectedNodes:", selectedNodes.value);
        console.log("treeNodes:", treeNodes.value);

    } catch (error) {
        console.error("Error fetching layers:", error);
    }
};

// Modified watch to handle nested layers more precisely
watch(
    selectedNodes,
    (newSelectedNodes) => {
        console.log("Selection Changed:", newSelectedNodes);

        // Recursive function to update layer visibility
        const updateLayerVisibility = () => {
            // Iterate through all layers in the map
            view.map.layers.forEach(mapLayer => {
                // Handle group layers
                if (mapLayer.layers && mapLayer.layers.items) {
                    // Track if any child is visible
                    let hasVisibleChild = false;

                    // Update child layers individually
                    mapLayer.layers.items.forEach(childLayer => {
                        const childSelection = newSelectedNodes[childLayer.id];
                        const isChildVisible = childSelection ? childSelection.checked : false;
                        
                        // Set individual child layer visibility
                        childLayer.visible = isChildVisible;

                        // Track if any child is visible
                        if (isChildVisible) {
                            hasVisibleChild = true;
                        }
                    });

                    // Update parent layer visibility based on children
                    const parentSelection = newSelectedNodes[mapLayer.id];
                    const isParentVisible = parentSelection 
                        ? (parentSelection.checked || hasVisibleChild)
                        : mapLayer.visible;
                    
                    mapLayer.visible = isParentVisible;
                } else {
                    // Handle individual layers
                    const layerSelection = newSelectedNodes[mapLayer.id];
                    const isVisible = layerSelection ? layerSelection.checked : mapLayer.visible;
                    mapLayer.visible = isVisible;
                }
            });
        };

        // Update layer visibility
        updateLayerVisibility();
    },
    { deep: true }
);

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
            <div>
                <div class="mb-3 flex items-center justify-between">
                    <FloatLabel>
                        <TreeSelect v-model="selectedNodes" :options="treeNodes" selectionMode="checkbox"
                            placeholder="Select Layers" inputId="layers_label" class="md:w-80 w-full" display="chip" />
                        <label for="layers_label">Select Layers</label>
                    </FloatLabel>
                    <h1 class="text-2xl font-semibold">{{ countryName }}</h1>
                </div>
                <div ref="mapViewDiv" style="padding: 0; margin: 0 ; height: 800px; width: 100%; position: relative; ">
                    <SpeedDial :model="speedDialItems" direction="left" :tooltipOptions="{ position: 'bottom' }"
                        style="position: absolute; top: 10px; right: 10px" />
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
</style>