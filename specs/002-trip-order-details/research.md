# Research: Trip Order Details

## 1. Interactive Map Implementation for React Native Web

**Decision**: Use a custom `react-native-webview` component that falls back to an `iframe` on Web to render an OpenStreetMap (Leaflet) view, or simply use an HTML `iframe` directly for the web build to avoid native dependency issues.

**Rationale**: The app is currently being built and exported for the Web (`npx expo export -p web`) and deployed via Nginx. Native map libraries like `@rnmapbox/maps` or `react-native-maps` often cause build failures or require complex configuration for web exports. An `iframe` loading an OpenStreetMap URL with routing parameters, or a custom Leaflet HTML string, provides interactive maps with markers without breaking the web build.

**Alternatives considered**:
- `@rnmapbox/maps`: Causes ERESOLVE and native build issues in pure web expo environments.
- `react-native-maps`: Also requires native linking which breaks the current simple Docker web build.
- SVG Map: Too complex to accurately plot GPS coordinates without a mapping library.

## 2. Estimated Time Calculation

**Decision**: Use a simulated calculation based on straight-line distance and a generic speed (e.g., 30 km/h) for the Proof of Concept, as there is no backend routing API currently specified or available in the `foodRMS` dependencies.

**Rationale**: Without an active Google Maps API key or OSRM backend integrated into the FoodRMS backend, we cannot do real-time traffic-based routing. A client-side heuristic (distance/speed) satisfies the requirement to "calculate and display" the estimated time while remaining within the frontend scope.

**Alternatives considered**:
- OSRM Public API: Rate limited and not suitable for production.
- Google Maps Distance Matrix: Requires API keys and billing setup not currently present in the project.

## 3. Brand Identity & Theming

**Decision**: Strictly utilize the existing color palette defined in the app (e.g., `#0F172A` text, `#FFFFFF` backgrounds, primary green/blue). Disable or remove any "Dark Mode" logic in the component.

**Rationale**: The user explicitly forbade changing the theme or colors, noting that the unified colors are the application's identity.

**Alternatives considered**:
- None. This is a hard constraint.
