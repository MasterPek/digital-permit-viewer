<script setup>
import { ref, onMounted, computed, watch } from "vue";
import MapView from "@arcgis/core/views/MapView";
import WebMap from "@arcgis/core/WebMap";
import esriConfig from "@arcgis/core/config";
import Print from "@arcgis/core/widgets/Print";
import Legend from "@arcgis/core/widgets/Legend";
import { useToast } from "primevue/usetoast";
import { imageryMap, streetMap } from "@/utils/basemap";
import { useBasemapStore } from "@/store/basemapStore";
import AuthACC from "./pages/auth/AuthACC.vue";
import DrawerWebmap from "@/layout/DrawerWebmap.vue";
import DrawerWebmapRight from "@/layout/DrawerWebmapRight.vue";
import { restoreCredentials } from "@/service/arcgis.service";
import { useRoute, useRouter } from "vue-router";

const basemapStore = useBasemapStore();

esriConfig.apiKey = import.meta.env.VITE_ARCGIS_CONFIG_APIKEY;
esriConfig.portalUrl = import.meta.env.VITE_ARCGIS_PORTAL_URL;

const toast = useToast();
const route = useRoute();
const router = useRouter();

const mapViewDiv = ref(null);

let view;
let webmap;
let print;
let legend;


const treeNodes = ref([]);
const selectedNodes = ref({});

const isDrawerOpen = ref(false);

const isRightDrawerOpen = ref(false);
const selectedForm = ref(null);

const popupData = ref(null);
const selectedFeature = ref(null);

const isPrintVisible = ref(false);
const isLegendVisible = ref(false)

// const countries = CountryService.getData();

// const countryCode = computed(() =>
//     esriConfig.portalUrl.split("-").pop().toUpperCase(),
// );
// const countryName = computed(() => {
//     const country = countries.find((c) => c.code === countryCode.value);
//     return country ? country.name : "Unknown";
// });
const hideLegend = () => {
	if (!isLegendVisible.value) {
		// If legend is about to be shown, hide the print widget
		isPrintVisible.value = false;
		if (print) print.visible = false;
	}
	isLegendVisible.value = !isLegendVisible.value;
	if (legend) legend.visible = isLegendVisible.value;
};

const hidePrint = () => {
	if (!isPrintVisible.value) {
		// If print is about to be shown, hide the legend widget
		isLegendVisible.value = false;
		if (legend) legend.visible = false;
	}
	isPrintVisible.value = !isPrintVisible.value;
	if (print) print.visible = isPrintVisible.value;
};

const handleCloseDrawers = () => {
	isRightDrawerOpen.value = false; // Close DrawerWebmapRight
};

const handleFormSelected = async (form) => {
	selectedForm.value = form;
	isRightDrawerOpen.value = true;

	await handleShowArea(form.id);
};

const handleShowArea = async (formId) => {
	if (!formId) return;

	// Decode URL-encoded values (e.g., %7B...%7D to {...})
	formId = decodeURIComponent(formId);

	// Replace Unicode curly braces (｛｝) with normal curly braces ({})
	formId = formId.replace(/｛/g, "{").replace(/｝/g, "}");

	// Normalize formId to ensure it has curly braces
	const uuidRegex = /[0-9a-fA-F-]{36}/;
	const match = formId.match(uuidRegex);

	if (match) {
		formId = `{${match[0].toUpperCase()}}`; // TODO: check perlu uppercase ke tidak
	} else {
		console.error("Invalid formId format:", formId);
		return;
	}

	if (view) {
		try {
			await view.when();

			const feature = await findFeatureByFormId(formId);
			if (feature) {
				selectedFeature.value = feature;
				popupData.value = {
					attributes: feature.attributes,
					layerName: feature.layer?.title,
					title: feature.layer?.popupTemplate?.title,
					content: feature.layer?.popupTemplate?.content
				};

				await zoomToFeature(formId);

				if (formId !== route.query.formid) {
					await router.push({ query: { ...route.query, formid: formId } });
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
		let foundFeature = null;
		let foundLayer = null;

		// Function to query a feature layer
		const queryFeatureLayer = async (layer) => {
			const query = {
				where: `formid = '${formId}'`,
				returnGeometry: true,
				outFields: ["*"]
			};
			console.log('Executing query:', query);

			try {
				const result = await layer.queryFeatures(query);

				if (result.features.length > 0) {
					const feature = result.features[0];
					console.log('Feature found:', feature.attributes);
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
				if (layer.title === "Digital Permit") {
					if (layer.type === "group") {
						if (!layer.loaded) {
							await layer.load();
						}

						// Search through sublayers
						for (const sublayer of layer.layers.items) {
							if (sublayer.type === "feature") {
								const feature = await queryFeatureLayer(sublayer);
								if (feature) {
									foundFeature = feature;
									foundLayer = sublayer;
									return { feature, layer: sublayer };
								}
							}
						}
					} else if (layer.type === "feature") {
						const feature = await queryFeatureLayer(layer);
						if (feature) {
							foundFeature = feature;
							foundLayer = layer;
							return { feature, layer };
						}
					}
				}
			}
			return null;
		};

		// Start the search from the webmap's layers
		const result = await searchLayers(webmap.layers.items);

		if (!result) {
			console.warn('No feature found in any layer.');
			toast.add({ severity: "warn", summary: "Feature Not Found", detail: "No feature found with the specified form ID", life: 3000 });
			return null;
		}

		return result;
	} catch (error) {
		console.error('Error in findFeatureByFormId:', error);
		return null;
	}
};

const zoomToFeature = async (formId) => {
	const result = await findFeatureByFormId(formId);
	if (!result) return;

	const { feature, layer } = result;

	try {
		await toggleLayerVisibility(formId, layer);

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

		// Set the selected feature for popup data
		selectedFeature.value = feature;
		popupData.value = {
			attributes: feature.attributes,
			layerName: layer.title,
			title: layer.popupTemplate?.title,
		};
	} catch (error) {
		console.error("Error zooming to feature:", error);
	}
};

const toggleLayerVisibility = async (formId, targetLayer) => {
	try {
		// Process group layers and their sublayers
		const processLayers = (layers) => {
			layers.forEach(layer => {
				// If it's a group layer, process its sublayers
				if (layer.type === "group") {
					const isDigitalPermitLayer = layer.title === "Digital Permit";

					// Set the whole group layer visible if it's the Digital Permit layer
					if (isDigitalPermitLayer) {
						layer.visible = true;

						// Process sublayers of Digital Permit
						if (layer.layers) {
							layer.layers.items.forEach(sublayer => {
								// For feature layers, show only the one containing our feature
								if (sublayer.type === "feature") {
									sublayer.visible = sublayer === targetLayer;

									// If this is our target layer, also apply a definition filter
									if (sublayer === targetLayer) {
										sublayer.definitionExpression = `formid = '${formId}'`;
									}
								}
							});
						}
					} else {
						// For other group layers, you can decide to hide them or keep them visible
						// depending on your application requirements
						layer.visible = false;
					}
				}
				// For standalone feature layers (not in a group)
				else if (layer.type === "feature") {
					if (layer === targetLayer) {
						layer.visible = true;
						layer.definitionExpression = `formid = '${formId}'`;
					} else {
						layer.visible = false;
					}
				}
			});
		};

		// Start processing from the webmap's layers
		processLayers(webmap.layers.items);

	} catch (error) {
		console.error("Error toggling layer visibility:", error);
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

	// view.on("drag", () => (mapViewDiv.value.style.cursor = "grabbing"));
	// view.on("drag-end", () => (mapViewDiv.value.style.cursor = "default"));
	// view.on("pointer-move", () => (mapViewDiv.value.style.cursor = "default"));

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

			if (formId) {
				await zoomToFeature(formId);
			}

			console.log('webmap', features);
			console.log('popupData.value', popupData.value);
		}
	});

	await view.when(
		() => {
			fetchAllLayers();

			const urlFormId = route.query.formid;
			if (urlFormId) {
				zoomToFeature(urlFormId);
			}
		},
		(error) => console.error("Error loading MapView:", error),
	);

	await view.when(() => {
		print = new Print({
			view: view,
			visible: isPrintVisible.value,
			printServiceUrl:
				"https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
		});

		const featureLayer = webmap.layers.getItemAt(0);

		legend = new Legend({
			view: view,
			layerInfos: [
				{
					layer: featureLayer,
				}
			],
			visible: isLegendVisible.value,
			hideLayersNotInCurrentView: false
		});

		view.ui.add(legend, "top-right");
		view.ui.add(print, "top-right");
	});
};

const resetAllFilters = () => {
	try {
		const resetLayers = (layers) => {
			layers.forEach(layer => {
				if (layer.type === "group") {
					layer.visible = true;

					if (layer.layers) {
						layer.layers.items.forEach(sublayer => {
							if (sublayer.type === "feature") {
								sublayer.visible = true;
								sublayer.definitionExpression = null; // Remove any definition expression
							}
						});
					}
				}
				else if (layer.type === "feature") {
					layer.visible = true;
					layer.definitionExpression = null; // Remove any definition expression
				}
			});
		};

		resetLayers(webmap.layers.items);

		// Remove formid from the URL
		const newQuery = { ...route.query };
		delete newQuery.formid;
		router.replace({ query: newQuery });

	} catch (error) {
		console.error("Error resetting filters:", error);
	}
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

		// console.log("selectedNodes:", selectedNodes.value);
		// console.log("treeNodes:", treeNodes.value);

	} catch (error) {
		console.error("Error fetching layers:", error);
	}
};

// Modified watch to handle nested layers more precisely
watch(
	selectedNodes,
	(newSelectedNodes) => {
		// console.log("Selection Changed:", newSelectedNodes);

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
			basemapStore.setBasemap("hybrid");
			toast.add({
				severity: "info",
				summary: "View Changed",
				detail: "Imagery Hybrid View Selected",
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
			await zoomToFeature(route.query.formid);

			console.log('popup', popupData.value);
		}
	}
});
</script>

<template>
	<div class="grid grid-cols-12 relative">
		<div class="col-span-12 relative w-full">
			<div>
				<!-- <div class="mb-3 flex items-center justify-between">
                    <h1 class="text-2xl font-semibold">{{ countryName }}</h1>
                </div> -->
				<div class="flex justify-end">
					<div ref="mapViewDiv" style="height: 94vh; width: 97%; position: relative; overflow: hidden;">
						<div class="absolute bottom-[65px] right-[10px] flex flex-col gap-2">
							<!-- Reset filter button -->
							<Button @click="resetAllFilters" icon="pi pi-filter-slash" rounded v-tooltip="'Reset layer filter'" />

							<!-- Print button -->
							<Button @click="hidePrint" icon="pi pi-print" rounded
								v-tooltip="isPrintVisible ? 'Hide print widget' : 'Show print widget'" />
							
							<!-- Legend button -->
							<Button @click="hideLegend" icon="pi pi-list" rounded
								v-tooltip="isLegendVisible ? 'Hide legend widget' : 'Show legend widget'" />
						</div>

						<!-- Speed dial button(change view) -->
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
	</div>
</template>
<style scoped></style>