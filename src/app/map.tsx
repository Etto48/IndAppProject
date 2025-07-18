"use client";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents, ZoomControl } from "react-leaflet";
import "leaflet-edgebuffer";


type MapViewProps = {
    currentLocation: [number, number] | null;
    focusOn: LocationMarkerProps | null;
    setFocusOn: (focusOn: LocationMarkerProps | null) => void;
    accuracy: number;
    markers: Array<LocationMarkerProps>;
};

type MapContentsProps = {
    centerMap: boolean;
    setCenterMap: (centerMap: boolean) => void;
    mapMoved: boolean;
    setMapMoved: (moved: boolean) => void;
} & MapViewProps;

type DetectMapEventsProps = {
    setMapMoved: (moved: boolean) => void,
    centerMap: boolean,
    setCenterMap: (centerMap: boolean) => void,
    setFocusOn: (focusOn: LocationMarkerProps | null) => void
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

const hotelActiveIcon = new Icon({
    iconUrl: './hotel_active.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const restaurantActiveIcon = new Icon({
    iconUrl: './restaurant_active.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const attractionActiveIcon = new Icon({
    iconUrl: './attraction_active.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const geoActiveIcon = new Icon({
    iconUrl: './geo_active.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const utilityIcon = new Icon({
    iconUrl: './utility.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const utilityActiveIcon = new Icon({
    iconUrl: './utility_active.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

const unknownActiveIcon = new Icon({
    iconUrl: './unknown_active.svg',
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize/2, iconSize],
    popupAnchor: [0, -iconSize],
});

function DetectMapEvents({ 
    setMapMoved, 
    centerMap, 
    setCenterMap,
    setFocusOn
}: DetectMapEventsProps) {
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

function ChangeMapView({ center, moved, centerMap, focusOn }: { center: [number, number] | null, moved: boolean , centerMap: boolean, focusOn: LocationMarkerProps | null }) {
    const map = useMap();
    useEffect(() => {
        if ((!moved && center) || focusOn) {
            let target: [number, number] | null = focusOn?.position || center;
            if (target) { // This is always true
                map.panTo(target, { animate: true, duration: 0.5 });
            }
        }
    }, [center, moved, map, centerMap, focusOn]);
    return null;
}

function selectIcon(category: string, active: boolean): Icon {
    switch (category) {
        case 'hotel':
            if (active) {
                return hotelActiveIcon;
            } else {
                return hotelIcon;
            }
        case 'restaurant':
            if (active) {
                return restaurantActiveIcon;
            } else {
                return restaurantIcon;
            }
        case 'attraction':
            if (active) {
                return attractionActiveIcon;
            } else {
                return attractionIcon;
            }
        case 'geo':
            if (active) {
                return geoActiveIcon;
            } else {
                return geoIcon;
            }
        case 'utility':
            if (active) {
                return utilityActiveIcon;
            } else {
                return utilityIcon;
            }
        default:
            if (active) {
                return unknownActiveIcon;
            } else {
                return unknownIcon; // Fallback icon
            }
    }
} 

function MapContents({ currentLocation, markers, focusOn, setFocusOn, accuracy, centerMap, setCenterMap, mapMoved, setMapMoved }: MapContentsProps) {
    let map = useMap();
    if (!map.getPane) return null;
    return (
        <>
        <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                edgeBufferTiles={1}
            />
            <ZoomControl position="bottomleft"/>
            {currentLocation &&
                <Marker position={currentLocation} icon={currentLocationIcon} zIndexOffset={500}>
                    <Popup>
                        You are here!
                    </Popup>
                </Marker>}
            {accuracy > 0 && currentLocation && 
                <Circle center={currentLocation} radius={accuracy} pathOptions={
                    { color: 'var(--foreground-important)', fillColor: 'var(--foreground-important)', fillOpacity: 0.1, weight: 1 }
                } />
            }
            {markers && markers.map((marker, index) => (
                <Marker 
                    key={index} 
                    position={marker.position} 
                    icon={selectIcon(marker.category, marker === focusOn)} 
                    zIndexOffset={marker === focusOn ? 1000 : 0}
                    >
                    <Popup>
                        {marker.name}
                    </Popup>
                </Marker>
            ))}
            <DetectMapEvents setMapMoved={setMapMoved} centerMap={centerMap} setCenterMap={setCenterMap} setFocusOn={setFocusOn}/>
            <ChangeMapView center={currentLocation} moved={mapMoved} centerMap={centerMap} focusOn={focusOn}/>
        </>
    )
}

export default function Map({currentLocation, markers, focusOn, setFocusOn, accuracy}: MapViewProps) {
    const [centerMap, setCenterMap] = useState(false);
    const [mapMoved, setMapMoved] = useState(false);
    const mapCenter: [number, number] = currentLocation ? currentLocation : [43.7230, 10.3966]; // Default center if no location is provided
    return (
        <>
        <MapContainer 
            center={mapCenter} 
            zoom={14} 
            className="map" 
            zoomControl={false} 
            minZoom={3} 
            maxBounds={[[-90, -190], [90, 190]]} 
            maxBoundsViscosity={.8}
            wheelPxPerZoomLevel={100}
            zoomSnap={0}
        >
            <MapContents 
                currentLocation={currentLocation}
                markers={markers}
                focusOn={focusOn}
                setFocusOn={setFocusOn}
                accuracy={accuracy}
                centerMap={centerMap}
                setCenterMap={setCenterMap}
                mapMoved={mapMoved}
                setMapMoved={setMapMoved}
            />
        </MapContainer>
        <button className={"reset-view-button" + ((mapMoved || focusOn)? " active" : "")} onClick={() => {
            setCenterMap(!centerMap);
            setFocusOn(null);
            setMapMoved(false);
        }}><div className="reset-view-button-wrapper">Reset map</div></button>
        </>
    );
}
