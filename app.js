document.addEventListener("DOMContentLoaded", async function() {

    // Default location (fallback)
    const defaultLocation = [10.715883361721279, 122.56625352427864];
    let currentLocation = defaultLocation;

    // Initialize map first at default
    const campusMap = L.map('map', {
        center: defaultLocation,
        zoom: 22,
        maxNativeZoom: 22,
        minZoom: 18,
        maxZoom: 22,
        scrollWheelZoom: true,
        zoomControl: true
    });

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(campusMap);

    // Try to get user's real location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentLocation = [position.coords.latitude, position.coords.longitude];
                campusMap.setView(currentLocation, 20);
                L.marker(currentLocation).addTo(campusMap).bindPopup("You are here").openPopup();
                document.getElementById('infoText').textContent = `Current Location: ${currentLocation[0]}, ${currentLocation[1]}`;
            },
            (error) => {
                console.warn("Geolocation failed, using default location.");
                L.marker(currentLocation).addTo(campusMap).bindPopup("Default location").openPopup();
            }
        );
    } else {
        console.warn("Geolocation not supported, using default location.");
        L.marker(currentLocation).addTo(campusMap).bindPopup("Default location").openPopup();
    }

    // Load buildings and populate dropdown
    const buildings = await GeoJSONManager.getBuildingsList('data/buildings.geojson');
    const geojsonLayer = L.geoJSON({
        type: "FeatureCollection",
        features: buildings.map(b => ({
            type: "Feature",
            properties: { name: b.name },
            geometry: { type: "Point", coordinates: [b.coords[1], b.coords[0]] }
        }))
    }).addTo(campusMap);

    campusMap.fitBounds(geojsonLayer.getBounds());

    const destinationSelect = document.getElementById('destination');
    destinationSelect.innerHTML = '<option value="">Select Building</option>';
    buildings.forEach(building => {
        const option = document.createElement('option');
        option.value = building.name;
        option.text = building.name;
        destinationSelect.appendChild(option);
    });

    // Navigate button event
    document.getElementById('navigateBtn').addEventListener('click', async () => {
        const destinationName = destinationSelect.value;
        if(!destinationName) return alert("Please select a building!");

        const stops = await GeoJSONManager.getStopsList('data/stops.geojson');
        const destination = buildings.find(b => b.name === destinationName);

        // Find nearest stop to the building
        let nearestStop = stops[0];
        let minDist = CampusNavigator._distance(destination.coords, stops[0].coords);
        stops.forEach(stop => {
            const dist = CampusNavigator._distance(destination.coords, stop.coords);
            if(dist < minDist) {
                minDist = dist;
                nearestStop = stop;
            }
        });

        // Remove previous route if exists
        if(window.currentRouteLayer) {
            campusMap.removeLayer(window.currentRouteLayer);
        }

        // Compute bounds for map
        const routeBounds = L.latLngBounds([currentLocation, nearestStop.coords, destination.coords]);
        campusMap.fitBounds(routeBounds, { padding: [60, 60] });

        // Start navigation animation
        window.currentRouteLayer = CampusNavigator.navigate(currentLocation, destinationName, campusMap);
    });

    // Show coordinates on map click
    campusMap.on('click', function(e) {
        const lat = e.latlng.lat.toFixed(9);
        const lon = e.latlng.lng.toFixed(9);
        L.popup()
         .setLatLng(e.latlng)
         .setContent(`Latitude: ${lat}<br>Longitude: ${lon}`)
         .openOn(campusMap);
    });

    // Ensure map resizes properly on window resize
    window.addEventListener('resize', () => {
        campusMap.invalidateSize();
    });

});
