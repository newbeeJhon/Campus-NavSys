class GeoJSONManager {
    static async getBuildingsList(url) {
        const res = await fetch(url);
        const data = await res.json();

        // Flip coordinates to [lat, lon] for Leaflet
        return data.features.map(f => ({
            name: f.properties.name,
            coords: [f.geometry.coordinates[1], f.geometry.coordinates[0]]
        }));
    }

    static async getStopsList(url) {
        const res = await fetch(url);
        const data = await res.json();

        // Flip coordinates to [lat, lon] for Leaflet
        return data.features.map(f => ({
            name: f.properties.name,
            coords: [f.geometry.coordinates[1], f.geometry.coordinates[0]]
        }));
    }
}
