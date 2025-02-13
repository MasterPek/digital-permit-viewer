import { ref, watch } from "vue";
import { streetMap, imageryMap } from "@/utils/basemap";

export function useBasemapSwitcher(view) {
  const value = ref("Street");
  const options = ref(["Street", "Imagery"]);

  watch(value, (newValue) => {
    if (view) {
      console.log("Switching basemap to:", newValue);  // Debugging log
      view.map.basemap = newValue === "Street" ? streetMap : imageryMap;
    }
  });

  return { value, options };
}
