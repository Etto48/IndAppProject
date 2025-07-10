"use client";
import StarsBar from "./stars_bar";
import { formatDistance, locationDistance } from "./utils";

function LocationIcon({ category, active }: { category: string, active?: boolean }) {
    let iconUrl = {
        restaurant: './restaurant.svg',
        attraction: './attraction.svg',
        hotel: './hotel.svg',
        geo: './geo.svg',
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
    return (
        <button className={"location-button " + (focusOn === marker? "active" : "")} onClick={() => setFocusOn(marker)}>
            <LocationIcon category={marker.category} active={focusOn === marker} />
            <div className="location-button-info">
                <strong className="location-button-name">{marker.name}</strong>
                {currentLocation && <small className="location-button-distance">{formatDistance(locationDistance(currentLocation, marker.position))} away</small>}
                {marker.rating && StarsBar({ stars: marker.rating })}
                <span className="location-button-description">{marker.description == ""? "No description available." : marker.description}</span>
            </div>
        </button>
    )
}