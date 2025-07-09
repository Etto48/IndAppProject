export function locationDistance(loc1: [number, number], loc2: [number, number]): number {
    const R = 6371e3; // metres
    const φ1 = loc1[0] * Math.PI / 180; // φ in radians
    const φ2 = loc2[0] * Math.PI / 180; // φ in radians
    const Δφ = (loc2[0] - loc1[0]) * Math.PI / 180; // Δφ in radians
    const Δλ = (loc2[1] - loc1[1]) * Math.PI / 180; // Δλ in radians

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
}

export function formatDistance(distance: number): string {
    if (distance < 1000) {
        return `${Math.round(distance)} m`;
    } else {
        return `${(distance / 1000).toFixed(1)} km`;
    }
}

export function locationMarkerPropsToRelativeMarkerProps(
    marker: LocationMarkerProps,
    currentLocation: [number, number]
): RelativeMarkerProps {
    const distance = locationDistance(currentLocation, marker.position);
    return {
        distance: distance,
        name: marker.name,
        category: marker.category,
        subcategory: marker.subcategory,
        description: marker.description
    };
}