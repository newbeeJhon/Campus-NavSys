class CampusNavigator {

    static routeLayer = null;

    static async navigate(currentLocation, destinationName, campusMap) {
        const buildings = await GeoJSONManager.getBuildingsList('data/buildings.geojson');
        const stops = await GeoJSONManager.getStopsList('data/stops.geojson');

        const destination = buildings.find(b => b.name === destinationName);
        if(!destination) return alert("Destination not found!");

        // --- Clear previous route ---
        if(CampusNavigator.routeLayer) {
            campusMap.removeLayer(CampusNavigator.routeLayer);
        }
        CampusNavigator.routeLayer = L.layerGroup().addTo(campusMap);

        // --- Find nearest stop to destination ---
        let nearestStop = stops[0];
        let minDist = CampusNavigator._distance(destination.coords, stops[0].coords);
        stops.forEach(stop => {
            const dist = CampusNavigator._distance(destination.coords, stop.coords);
            if(dist < minDist) {
                minDist = dist;
                nearestStop = stop;
            }
        });

        // --- Icons ---
        const nearestStopIcon = L.icon({
            iconUrl: 'assets/icons/stop.png',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35]
        });
        const destinationIcon = L.icon({
            iconUrl: 'assets/icons/destination.png',
            iconSize: [35, 35],
            iconAnchor: [17, 35],
            popupAnchor: [0, -35]
        });

        L.marker(nearestStop.coords, { icon: nearestStopIcon })
         .bindPopup(`Nearest Stop: ${nearestStop.name}`)
         .addTo(CampusNavigator.routeLayer);

        L.marker(destination.coords, { icon: destinationIcon })
         .bindPopup(`Destination: ${destination.name}`)
         .addTo(CampusNavigator.routeLayer);

        // --- Animate Route with Moving Marker ---
        const routePoints = [currentLocation, nearestStop.coords, destination.coords];
        let animatedLine = L.polyline([routePoints[0]], { color: 'blue', weight: 4 }).addTo(CampusNavigator.routeLayer);

        // Moving marker
        const travelerIcon = L.icon({
            iconUrl: 'assets/icons/marker.svg', // a small dot or person icon
            iconSize: [25, 25],
            iconAnchor: [12, 12]
        });
        const traveler = L.marker(currentLocation, { icon: travelerIcon }).addTo(CampusNavigator.routeLayer);

        let segmentIndex = 0;
        let step = 0;
        const stepIncrement = 0.08;  // speed of animation
        const intervalTime = 20;     // update frequency

        const timer = setInterval(() => {
            const start = routePoints[segmentIndex];
            const end = routePoints[segmentIndex + 1];

            const lat = start[0] + (end[0] - start[0]) * step;
            const lon = start[1] + (end[1] - start[1]) * step;

            // Update animated line
            animatedLine.addLatLng([lat, lon]);

            // Move the traveler
            traveler.setLatLng([lat, lon]);

            step += stepIncrement;

            if(step >= 1) {
                // Move to next segment
                segmentIndex++;
                step = 0;

                if(segmentIndex >= routePoints.length - 1) {
                    clearInterval(timer);
                    // Ensure traveler ends exactly at destination
                    traveler.setLatLng(destination.coords);
                }
            }
        }, intervalTime);
    }

    static _distance(a, b) {
        const latDiff = a[0] - b[0];
        const lonDiff = a[1] - b[1];
        return Math.sqrt(latDiff*latDiff + lonDiff*lonDiff);
    }
}
