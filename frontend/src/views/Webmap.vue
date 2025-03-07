<script setup>
import { ref, onMounted, computed, watch } from "vue";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import Print from "@arcgis/core/widgets/Print";
import { useToast } from "primevue/usetoast";
import { imageryMap, streetMap } from "@/utils/basemap";
import { useBasemapStore } from "@/store/basemapStore";
import { useScreenshotStore } from "@/store/screenshotStore";
import AuthACC from "./pages/auth/AuthACC.vue";
import DrawerWebmap from "@/layout/DrawerWebmap.vue";
import DrawerWebmapRight from "@/layout/DrawerWebmapRight.vue";
import { restoreCredentials } from "@/service/arcgis.service";
import { useRoute, useRouter } from "vue-router";
import { fastapiPermitAnnotations } from "@/service/fastapi.service";

const basemapStore = useBasemapStore();
const screenshotStore = useScreenshotStore()

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_CONFIG_APIKEY;
esriConfig.portalUrl = import.meta.env.VITE_ARCGIS_PORTAL_URL;

const toast = useToast();
const route = useRoute();
const router = useRouter();

const mapViewDiv = ref(null);

let view;
let webmap;

const treeNodes = ref([]);
const selectedNodes = ref({});

const isDrawerOpen = ref(false);

const isRightDrawerOpen = ref(false);
const selectedForm = ref(null);

const popupData = ref(null);
const selectedFeature = ref(null);

// const countries = CountryService.getData();

// const countryCode = computed(() =>
//     esriConfig.portalUrl.split("-").pop().toUpperCase(),
// );
// const countryName = computed(() => {
//     const country = countries.find((c) => c.code === countryCode.value);
//     return country ? country.name : "Unknown";
// });

const handleCloseDrawers = () => {
	isRightDrawerOpen.value = false; // Close DrawerWebmapRight
};

const handleFormSelected = (form) => {
  if (selectedForm.value?.id === form.id) {
    // If the drawer is closed, reopen it; otherwise, close it
    if (!isRightDrawerOpen.value) {
      isRightDrawerOpen.value = true;
    } else {
      isRightDrawerOpen.value = false;
    }
  } else {
    // Set the selected form and open the drawer
    selectedForm.value = form;
    isRightDrawerOpen.value = true;
  }
};

const handleShowArea = async (formId) => {
	// console.log('formId parameter:', formId);

	// Ensure formId is enclosed in {}
	if (typeof formId === "string" && !formId.startsWith("{")) {
		formId = `{${formId.replace(/{|}/g, "").toUpperCase()}}`; // Add {} if missing
	}

	if (formId && view) {
		try {
			// Wait for view to be ready
			await view.when();

			// Check if the formId parameter matches the route query formId
			if (formId === route.query.formid) {
				const feature = await findFeatureByFormId(formId);
				if (feature) {
					// Set the selected feature and popup data
					selectedFeature.value = feature;
					popupData.value = {
						attributes: feature.attributes,
						layerName: feature.layer?.title,
						title: feature.layer?.popupTemplate?.title,
						content: feature.layer?.popupTemplate?.content
					};

					// Zoom to the feature
					await zoomToFeature(feature);
				}
			} else {
				// Update the route with the new formId
				await router.push({ query: { ...route.query, formid: formId } });

				// Now find and zoom to the feature with the new formId
				const feature = await findFeatureByFormId(formId);
				if (feature) {
					selectedFeature.value = feature;
					popupData.value = {
						attributes: feature.attributes,
						layerName: feature.layer?.title,
						title: feature.layer?.popupTemplate?.title,
						content: feature.layer?.popupTemplate?.content
					};

					await zoomToFeature(feature);
				}
			}
		} catch (error) {
			console.error("Error handling show area:", error);
		}
	}
};

const findFeatureByFormId = async (formId) => {
	if (!webmap || !formId) {
		console.warn('webmap or formId is missing.');
		return null;
	}

	try {
		await webmap.loadAll();

		// Function to query a feature layer
		const queryFeatureLayer = async (layer) => {
			// console.log(`Querying feature layer: ${layer.title}`);

			const query = {
				where: `formid = '${formId}'`,
				returnGeometry: true,
				outFields: ["*"]
			};
			console.log('Executing query:', query);

			try {
				const result = await layer.queryFeatures(query);
				// console.log('Query result:', result);

				if (result.features.length > 0) {
					const feature = result.features[0];
					console.log('Feature found:', feature);
					feature.layer = layer;
					return feature;
				}
				return null;
			} catch (error) {
				console.error(`Error querying layer ${layer.title}:`, error);
				return null;
			}
		};

		// Function to recursively search through layers
		const searchLayers = async (layers) => {
			for (const layer of layers) {
				// console.log(`Checking layer: ${layer.title} (Type: ${layer.type})`);

				if (layer.title === "Digital Permit") {
					if (layer.type === "group") {
						// console.log('Found layer.title group layer, searching sublayers...');
						// Load the group layer if it hasn't been loaded
						if (!layer.loaded) {
							await layer.load();
						}

						// Search through sublayers
						for (const sublayer of layer.layers.items) {
							// console.log(`Checking sublayer: ${sublayer.title} (Type: ${sublayer.type})`);

							if (sublayer.type === "feature") {
								const feature = await queryFeatureLayer(sublayer);
								if (feature) return feature;
							}
						}
					} else if (layer.type === "feature") {
						const feature = await queryFeatureLayer(layer);
						if (feature) return feature;
					}
				}

				// If the layer has sublayers, search through them
				// if (layer.layers) {
				//     const feature = await searchLayers(layer.layers.items);
				//     if (feature) return feature;
				// }
			}
			return null;
		};

		// Start the search from the webmap's layers
		const feature = await searchLayers(webmap.layers.items);

		if (!feature) {
			console.warn('No feature found in any layer.');
			toast.add({ severity: "warn", summary: "Feature Not Found", detail: "No feature found with the specified form ID", life: 3000 });
		}

		return feature;
	} catch (error) {
		console.error('Error in findFeatureByFormId:', error);
		return null;
	}
};

const zoomToFeature = async (feature) => {
	if (!feature) return;

	try {
		// Get the feature's geometry
		const geometry = feature.geometry;

		if (geometry) {
			// Add padding and zoom to the feature
			await view.goTo({
				target: geometry,
				padding: {
					top: 50,
					right: 50,
					bottom: 50,
					left: 50
				},
			}, {
				duration: 1000  // Animation duration in milliseconds
			});
		}
	} catch (error) {
		console.error("Error zooming to feature:", error);
	}
};

const initializeMapView = async () => {
	webmap = new WebMap({
		portalItem: { id: import.meta.env.VITE_ARCGIS_WEBMAP_ID },
		basemap: basemapStore.currentBasemapId,
	});

	view = new MapView({
		container: mapViewDiv.value,
		map: webmap,
	});

	view.on("drag", () => (mapViewDiv.value.style.cursor = "grabbing"));
	view.on("drag-end", () => (mapViewDiv.value.style.cursor = "default"));
	view.on("pointer-move", () => (mapViewDiv.value.style.cursor = "default"));

	view.on("click", async (event) => {
		const response = await view.hitTest(event);

		const features = response.results?.filter(
			(result) => result.graphic?.layer?.type !== "graphics"
		);

		if (features && features.length > 0) {
			const feature = features[0].graphic;
			selectedFeature.value = feature;
			popupData.value = {
				attributes: feature.attributes,
				layerName: feature.layer?.title,
				title: feature.layer?.popupTemplate?.title,
			};

			// Update URL with formid
			const formId = feature.attributes.formid;
			router.push({ query: { ...route.query, formid: formId } });

			console.log('webmap', webmap.layers.items);
			console.log('popupData.value', popupData.value);
		}
	});

	await view.when(
		() => {
			fetchAllLayers();
		},
		(error) => console.error("Error loading MapView:", error),
	);

	await view.when(() => {
		const print = new Print({
			view: view,
			// specify your own print service
			printServiceUrl:
				"https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
		});

		// Add widget to the top right corner of the view
		view.ui.add(print, "top-right");
	});
};

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

const fetchAllLayers = async () => {
	try {
		const operationalLayers = webmap.layers.toArray();
		console.table("operationalLayers:", operationalLayers);

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

async function fetchFastApiPermitAnnotations() {
	const res = await fastapiPermitAnnotations();
}

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

// watch(() => route.query.formid, async (newFormId) => {
//     if (newFormId && view) {
//         try {
//             // Wait for view to be ready
//             await view.when();

//             const feature = await findFeatureByFormId(newFormId);
//             if (feature) {
//                 selectedFeature.value = feature;
//                 popupData.value = {
//                     attributes: feature.attributes,
//                     layerName: feature.layer?.title,
//                     title: feature.layer?.popupTemplate?.title,
//                     content: feature.layer?.popupTemplate?.content
//                 };
//                 await zoomToFeature(feature);
//             }
//         } catch (error) {
//             console.error("Error handling formId change:", error);
//         }
//     }
// });

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

onMounted(async () => {
	await restoreCredentials();
	await initializeMapView();
	if (route.query.formid) {
		const feature = await findFeatureByFormId(route.query.formid);
		if (feature) {
			// Set the selected feature and popup data
			selectedFeature.value = feature;
			popupData.value = {
				attributes: feature.attributes,
				layerName: feature.layer?.title,
				title: feature.layer?.popupTemplate?.title,
				content: feature.layer?.popupTemplate?.content
			};

			// Zoom to the feature
			await zoomToFeature(feature);
		}
	}
	screenshotStore.setMapViewDiv(mapViewDiv.value)
});
</script>

<template>
	<div class="grid grid-cols-12 relative">
		<div class="col-span-12 relative w-full">
			<div>
				<!-- <div class="mb-3 flex items-center justify-between">
                    <h1 class="text-2xl font-semibold">{{ countryName }}</h1>
                </div> -->
				<div ref="mapViewDiv" style="height: 94vh; width: 100%; position: relative; overflow: hidden;">
					<SpeedDial :model="speedDialItems" direction="left" :tooltipOptions="{ position: 'bottom' }"
						style="position: absolute; bottom: 25px; right: 10px" />
					<DrawerWebmap v-model="isDrawerOpen" @close-drawers="handleCloseDrawers">
						<template #default="{ drawerTitle }">
							<div v-if="drawerTitle === 'Layer'">
								<Tree v-model:selectionKeys="selectedNodes" :value="treeNodes" selectionMode="checkbox"
									style="margin: 0; padding: 0" />
							</div>
							<div class="h-full" v-else-if="drawerTitle === 'Permit'">
								<AuthACC @formSelected="handleFormSelected" />
							</div>
						</template>
					</DrawerWebmap>
					<DrawerWebmapRight v-model="isRightDrawerOpen" :selectedForm="selectedForm" @show-area="handleShowArea" />
				</div>
			</div>
		</div>
	</div>
</template>
<style scoped></style>