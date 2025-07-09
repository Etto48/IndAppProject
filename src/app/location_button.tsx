"use client";
import { formatDistance, locationDistance } from "./utils";

function LocationIcon({ category }: { category: string }) {
    const iconUrl = {
        restaurant: './restaurant.svg',
        attraction: './attraction.svg',
        hotel: './hotel.svg',
        geo: './geo.svg',
        unknown: './unknown.svg'
    }[category] || './unknown.svg';
    return (
        <img src={iconUrl} alt={category} />
    );
}

export default function LocationButton({currentLocation, marker, setFocusOn}: {
    currentLocation: [number, number] | null, 
    marker: LocationMarkerProps,
    setFocusOn: (focusOn: [number, number] | null) => void
}) {
    return (
        <button className="location-button" onClick={() => setFocusOn(marker.position)}>
            <LocationIcon category={marker.category} />
            <div className="location-button-info">
                <strong>{marker.name}</strong>
                {currentLocation && <span>{formatDistance(locationDistance(currentLocation, marker.position))} away</span>}
            </div>
        </button>
    )
}