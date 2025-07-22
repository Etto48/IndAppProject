"use client";
import StarsBar from "./stars_bar";
import { formatDistance, locationDistance } from "./utils";

function LocationIcon({ category, active }: { category: string, active?: boolean }) {
    let iconUrl = {
        restaurant: './restaurant.svg',
        attraction: './attraction.svg',
        hotel: './hotel.svg',
        geo: './geo.svg',
        utility: './utility.svg',
        unknown: './unknown.svg'
    }[category] || './unknown.svg';
    if (active) {
        iconUrl = iconUrl.replace('.svg', '_active.svg');
    }
    return (
        <img src={iconUrl} alt={category} />
    );
}

type LocationButtonProps = {
    currentLocation: [number, number] | null,
    marker: LocationMarkerProps,
    focusOn: LocationMarkerProps | null,
    setFocusOn: (focusOn: LocationMarkerProps | null) => void
};

export default function LocationButton({currentLocation, marker, focusOn, setFocusOn}: LocationButtonProps) {
    const isActive = focusOn === marker;

    const handleToggle = () => {
        if (isActive) {
            setFocusOn(null);
        } else {
            setFocusOn(marker);
        }
    };

    let description = marker.comparison_text;
    if (!description && (marker.category === 'restaurant' || marker.category === 'hotel')) {
        description = "Not enough data";
    }

    return (
        <button className={"location-button " + (isActive ? "active " : "") + (marker.priority > 0 ? "premium" : "")} onClick={handleToggle}>
            <LocationIcon category={marker.category} active={isActive} />
            <div className="location-button-info">
                <strong className="location-button-name">{marker.name}</strong>
                {currentLocation && <small className="location-button-distance">{formatDistance(locationDistance(currentLocation, marker.position))} away</small>}
                {marker.rating && <StarsBar stars={marker.rating} />}
                {description && <div className="location-button-description">{description}</div>}
            </div>
            <a className="location-button-open-maps" href={`https://www.google.com/maps/search/?api=1&query=${marker.position[0]}%2C${marker.position[1]}&query_place_id=${marker.location_id}`} target="_blank" rel="noopener noreferrer">
                <img src="./open_in_maps.svg" alt="Open in Maps" />
            </a>
        </button>
    )
}