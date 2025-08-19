class CampusMap {
    constructor(mapId, center, zoom) {
        this.map = L.map(mapId).setView(center, zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);
    }

    addMarker(lat, lon, popupText) {
        const marker = L.marker([lat, lon]).addTo(this.map);
        if(popupText) marker.bindPopup(popupText);
        return marker;
    }

    addPolyline(latlngs, options = {}) {
        return L.polyline(latlngs, options).addTo(this.map);
    }
}
