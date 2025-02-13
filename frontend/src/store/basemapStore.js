import { streetMap, imageryMap } from "@/utils/basemap";
import { defineStore } from "pinia";

export const useBasemapStore = defineStore("basemap", {
  state: () => ({
    currentBasemapId: "osm", // Default basemap ID
  }),
  actions: {
    setBasemap(id) {
      this.currentBasemapId = id;
    },
  },
});

