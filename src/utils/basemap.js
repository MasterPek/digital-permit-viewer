import Basemap from "@arcgis/core/Basemap";
import VectorTileLayer from "@arcgis/core/layers/VectorTileLayer";
import TileLayer from "@arcgis/core/layers/TileLayer";

export const streetMap = new Basemap({
  baseLayers: [
    new VectorTileLayer({
      url: "https://basemaps.arcgis.com/arcgis/rest/services/OpenStreetMap_v2/VectorTileServer",
    }),
  ],
  title: "OpenStreetMap",
  id: "osm",
});

export const imageryMap = new Basemap({
  baseLayers: [
    new TileLayer({
      url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
    }),
  ],
  title: "World Imagery",
  id: "world-imagery",
});
