"use client";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";


type MapViewProps = {
    currentLocation: [number, number] | null;
    focusOn: [number, number] | null;
    setFocusOn: (focusOn: [number, number] | null) => void;
    markers?: Array<LocationMarkerProps>;
};

const iconSize = 60;

const currentLocationIcon = new Icon({
    iconUrl: './current_location.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const hotelIcon = new Icon({
    iconUrl: './hotel.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const restaurantIcon = new Icon({
    iconUrl: './restaurant.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const attractionIcon = new Icon({
    iconUrl: './attraction.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const geoIcon = new Icon({
    iconUrl: './geo.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const unknownIcon = new Icon({
    iconUrl: './unknown.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

function DetectMapEvents({ 
    setMapMoved, 
    centerMap, 
    setCenterMap,
    setFocusOn
}: { 
    setMapMoved: (moved: boolean) => void, 
    centerMap: boolean, 
    setCenterMap: (centerMap: boolean) => void,
    setFocusOn: (focusOn: [number, number] | null) => void
}) {
    const events = useMapEvents({
        drag: () => {
            setMapMoved(true);
            setFocusOn(null);
        },
        zoom: () => {
           setCenterMap(!centerMap);
        }
    })
    return null;
}

function ChangeMapView({ center, moved, centerMap, focusOn }: { center: [number, number] | null, moved: boolean , centerMap: boolean, focusOn: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if ((!moved && center) || focusOn) {
            let target: [number, number] | null = focusOn || center;
            if (target) { // This is always true
                map.panTo(target, { animate: true, duration: 0.5 });
            }
        }
    }, [center, moved, map, centerMap, focusOn]);
    return null;
}

function selectIcon(category: string): Icon {
    switch (category) {
        case 'hotel':
            return hotelIcon;
        case 'restaurant':
            return restaurantIcon;
        case 'attraction':
            return attractionIcon;
        case 'geo':
            return geoIcon;
        default:
            return unknownIcon;
    }
} 

export default function Map({currentLocation, markers, focusOn, setFocusOn}: MapViewProps) {
    const [centerMap, setCenterMap] = useState(false);
    const [mapMoved, setMapMoved] = useState(false);
    const mapCenter: [number, number] = currentLocation ? currentLocation : [43.7230, 10.3966]; // Default center if no location is provided
    return (
        <>
        <MapContainer center={mapCenter} zoom={15} className="map">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {currentLocation &&
                <Marker position={currentLocation} icon={currentLocationIcon}>
                    <Popup>
                        You are here!
                    </Popup>
                </Marker>}
            {markers && markers.map((marker, index) => (
                <Marker key={index} position={marker.position} icon={selectIcon(marker.category)}>
                    <Popup>
                        {marker.name}
                    </Popup>
                </Marker>
            ))}
            <DetectMapEvents setMapMoved={setMapMoved} centerMap={centerMap} setCenterMap={setCenterMap} setFocusOn={setFocusOn}/>
            <ChangeMapView center={currentLocation} moved={mapMoved} centerMap={centerMap} focusOn={focusOn}/>
        </MapContainer>
        <button className={"reset-view-button" + ((mapMoved || focusOn)? " active" : "")} onClick={() => {
            setCenterMap(!centerMap);
            setFocusOn(null);
            setMapMoved(false);
        }}>Reset map</button>
        </>
    );
}
