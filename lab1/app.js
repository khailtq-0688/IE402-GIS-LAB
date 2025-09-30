/* global require */
require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/GraphicsLayer",
  "esri/widgets/Sketch",
  "esri/Graphic",
  "esri/geometry/Point",
  "esri/geometry/Polyline",
  "esri/geometry/support/webMercatorUtils",
], function (
  Map,
  MapView,
  GraphicsLayer,
  Sketch,
  Graphic,
  Point,
  Polyline,
  webMercatorUtils
) {
  const layer = new GraphicsLayer();
  const map = new Map({ basemap: "topo-vector", layers: [layer] });

  const view = new MapView({
    container: "viewDiv",
    map,
    center: [106.63, 10.82],
    constraints: { snapToZoom: false },
  });

  const sketch = new Sketch({
    view,
    layer,
    creationMode: "continuous", // 4.33+ keeps the active tool
    availableCreateTools: ["point", "polyline"],
    visibleElements: {
      createTools: { rectangle: false, circle: false, polygon: false },
    },
  });
  view.ui.add(sketch, "top-left");

  // UI refs
  const jsonBox = document.getElementById("jsonBox");
  const exportBtn = document.getElementById("exportBtn");
  const loadBtn = document.getElementById("loadBtn");
  const clearBtn = document.getElementById("clearBtn");
  const copyBtn = document.getElementById("copyBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const clickMode = document.getElementById("clickMode");
  const minZoomInput = document.getElementById("minZoom");
  const maxZoomInput = document.getElementById("maxZoom");
  const startZoomInput = document.getElementById("startZoom");
  const applyZoomBtn = document.getElementById("applyZoom");
  function applyZoomConstraints() {
    const minZ = Number(minZoomInput.value);
    const maxZ = Number(maxZoomInput.value);
    if (Number.isNaN(minZ) || Number.isNaN(maxZ) || minZ > maxZ) return;
    let startZ = Number(startZoomInput.value);
    if (Number.isNaN(startZ)) startZ = (minZ + maxZ) / 2;
    if (startZ < minZ) startZ = minZ;
    if (startZ > maxZ) startZ = maxZ;
    view.constraints = Object.assign({}, view.constraints, {
      minZoom: minZ,
      maxZoom: maxZ,
    });
    view.zoom = startZ;
  }

  applyZoomBtn.addEventListener("click", applyZoomConstraints);
  [minZoomInput, maxZoomInput, startZoomInput].forEach((el) => {
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyZoomConstraints();
    });
  });
  applyZoomConstraints();

  const pretty = (obj) => JSON.stringify(obj, null, 2);

  function exportFeatures() {
    const features = [];
    layer.graphics.forEach((g) => {
      const geom = g.geometry;
      if (!geom) return;

      const geo =
        geom.spatialReference && geom.spatialReference.isWGS84
          ? geom
          : webMercatorUtils.webMercatorToGeographic(geom);

      if (geo.type === "point") {
        features.push({
          type: "Feature",
          properties: g.attributes || {},
          geometry: {
            type: "Point",
            coordinates: [geo.longitude, geo.latitude],
          },
        });
      } else if (geo.type === "polyline") {
        const paths = geo.paths || [];
        paths.forEach((path) => {
          if (path.length >= 2) {
            features.push({
              type: "Feature",
              properties: g.attributes || {},
              geometry: {
                type: "LineString",
                coordinates: path.map(([x, y]) => [x, y]),
              },
            });
          }
        });
      }
    });

    return { type: "FeatureCollection", features };
  }

  function refreshExport() {
    jsonBox.value = pretty(exportFeatures());
  }

  function importToMap() {
    let parsed;
    try {
      parsed = JSON.parse(jsonBox.value);
    } catch (e) {
      alert("Invalid JSON");
      return;
    }

    const feats = Array.isArray(parsed?.features) ? parsed.features : [];
    layer.removeAll();

    const graphics = [];
    for (const f of feats) {
      const geom = f?.geometry;
      if (!geom) continue;

      if (geom.type === "Point") {
        const [x, y] = geom.coordinates || [];
        const p4326 = new Point({
          longitude: x,
          latitude: y,
          spatialReference: { wkid: 4326 },
        });
        const p = webMercatorUtils.geographicToWebMercator(p4326);
        graphics.push(new Graphic({ geometry: p }));
      } else if (geom.type === "LineString") {
        const coords = geom.coordinates || [];
        if (coords.length >= 2) {
          const pl4326 = new Polyline({
            paths: [coords],
            spatialReference: { wkid: 4326 },
          });
          const pl = webMercatorUtils.geographicToWebMercator(pl4326);
          graphics.push(new Graphic({ geometry: pl }));
        }
      }
    }

    if (graphics.length) {
      layer.addMany(graphics);
      const ext = layer.fullExtent;
      if (ext) view.goTo(ext.expand(1.2));
    }
    refreshExport();
  }

  function clearAll() {
    layer.removeAll();
    refreshExport();
  }

  // Optional: quick point mode (click map to add many points, no toolbar)
  let clickHandle = null;
  clickMode.addEventListener("change", () => {
    if (clickMode.checked) {
      clickHandle = view.on("click", (evt) => {
        const mapPoint = evt.mapPoint;
        const p4326 = webMercatorUtils.webMercatorToGeographic(mapPoint);
        const g = new Graphic({
          geometry: mapPoint,
          attributes: { lon: p4326.longitude, lat: p4326.latitude },
        });
        layer.add(g);
        refreshExport();
      });
    } else {
      clickHandle && clickHandle.remove();
      clickHandle = null;
    }
  });

  // Keep export updated on edits
  sketch.on("create", (e) => {
    if (e.state === "complete") {
      refreshExport();
      // Fallback if creationMode isn't respected for point
      if (e.tool === "point" && sketch.creationMode !== "continuous") {
        try {
          sketch.create("point");
        } catch (_) {}
      }
    }
  });
  sketch.on("update", (e) => {
    if (e.state === "complete") refreshExport();
  });
  sketch.on("delete", refreshExport);

  // Buttons
  exportBtn.addEventListener("click", refreshExport);
  loadBtn.addEventListener("click", importToMap);
  clearBtn.addEventListener("click", clearAll);

  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(jsonBox.value);
      alert("Copied GeoJSON!");
    } catch {
      alert("Clipboard unavailable in this context.");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const blob = new Blob([jsonBox.value], {
      type: "application/vnd.geo+json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `features-${Date.now()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  });

  // Initial export
  refreshExport();
});
