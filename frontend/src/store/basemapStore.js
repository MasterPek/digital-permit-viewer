import { streetMap, imageryMap } from "@/utils/basemap";
import { defineStore } from "pinia";

// NOTE: Options to change default basemap
// world-imagery
// osm
// street
// satellite
// topo
// gray
// dark-gray
// oceans

export const useBasemapStore = defineStore("basemap", {
  state: () => ({
    currentBasemapId: "hybrid", // Default basemap ID
  }),
  actions: {
    setBasemap(id) {
      this.currentBasemapId = id;
    },
  },
});

